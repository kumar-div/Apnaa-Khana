import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail } from "@/lib/email";
import type { Order } from "@/data/orders";

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "";

// Server-side Supabase client for webhook (bypasses RLS utilizing SERVICE_ROLE_KEY)
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("⚠️ CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing. Webhook will fail.");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

function verifySignature(body: string, signature: string): boolean {
  try {
    const expected = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(body)
      .digest("hex");
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expected, "hex")
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  console.log("🔔 WEBHOOK: Request received");

  try {
    // 1. Read raw body natively from stream
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!body || !signature) {
      console.error("❌ WEBHOOK: Missing body or signature");
      return NextResponse.json(
        { error: "Missing body or signature" },
        { status: 400 }
      );
    }

    // 2. Verify signature BEFORE parsing JSON
    if (!verifySignature(body, signature)) {
      console.error("❌ WEBHOOK: Signature verification FAILED");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    console.log("✅ WEBHOOK: Signature verified");

    // 3. Parse JSON only after verification
    let event: any;
    try {
      event = JSON.parse(body);
    } catch {
      console.error("❌ WEBHOOK: Malformed JSON");
      return NextResponse.json(
        { error: "Malformed JSON" },
        { status: 400 }
      );
    }

    const eventType = event?.event;
    console.log("📨 WEBHOOK: Event type:", eventType);

    // 4. Handle only payment.captured
    if (eventType !== "payment.captured") {
      console.log("⏭️ WEBHOOK: Ignoring event:", eventType);
      return NextResponse.json({ status: "ignored" });
    }

    // 5. Extract payment & notes
    const payment = event?.payload?.payment?.entity;
    if (!payment) {
      console.error("❌ WEBHOOK: Missing payment entity");
      return NextResponse.json(
        { error: "Missing payment entity" },
        { status: 400 }
      );
    }

    const razorpayPaymentId = payment.id;
    const amount = payment.amount;
    const notes = payment.notes || {};
    const supabaseOrderId = notes?.order_id; // Extract from notes

    console.log("💳 WEBHOOK: Payment details:", {
      razorpay_payment_id: razorpayPaymentId,
      amount,
      supabase_order_id: supabaseOrderId,
    });

    if (!supabaseOrderId) {
      console.error("❌ WEBHOOK: Missing order_id in payment notes");
      return NextResponse.json(
        { error: "Missing order_id in notes" },
        { status: 400 }
      );
    }



    // 6. Analyze pre-trigger status (Defensive check instead of fragile abort)
    const { data: existingOrderData, error: fetchError } = await supabase
      .from("orders")
      .select("status, payment_status")
      .eq("id", supabaseOrderId)
      .single();

    if (fetchError || !existingOrderData) {
      console.error("❌ WEBHOOK: Could not find order to analyze", supabaseOrderId);
      return NextResponse.json({ status: "ok", warning: "order_not_found" });
    }

    console.log(`🛡️ DEFENSIVE LOG [PRE-UPDATE]: Order Status is '${existingOrderData.status}' | Payment Status is '${existingOrderData.payment_status}'`);
    // Note: We deliberately DO NOT abort here if payment_status is 'paid', 
    // because optimistic UI updates trigger this maliciously. We MUST continue to securely trigger emails.

    // 7. Update correct row in Supabase using the order_id from notes securely bypassing RLS
    const { data, error } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        status: "confirmed",
        razorpay_payment_id: razorpayPaymentId,
      })
      .eq("id", supabaseOrderId)
      .select("*");

    if (error) {
      console.error("❌ WEBHOOK: Supabase update error:", error.message);
      return NextResponse.json({ status: "ok", warning: "db_update_failed" });
    }

    if (!data || data.length === 0) {
      console.warn("⚠️ WEBHOOK: No matching order found for ID:", supabaseOrderId);
      return NextResponse.json({ status: "ok", warning: "no_matching_order" });
    }

    console.log("✅ WEBHOOK: Order updated successfully:", data[0].id);

    // 7. Send Order Confirmation Email
    const updatedOrder = data[0];
    const customerEmail = updatedOrder.customer_email || payment.email; // Fallback to razorpay payment email if needed
    
    console.log(`🛡️ DEFENSIVE LOG [TRIGGER]: Dispatching secure emails for order ${updatedOrder.id}...`);

    if (customerEmail) {
      await sendOrderConfirmationEmail(updatedOrder as Order, customerEmail);
    }
    
    // 8. Send Admin New Order Notification Alert
    await sendAdminNewOrderEmail(updatedOrder as Order);
    
    // 9. Permanently Consume First Order Discount Flag
    if (updatedOrder.user_id) {
       // Secure UPSERT bypassing RLS to aggressively flag their profile natively
       const { error: profileError } = await supabase.from('user_profiles').upsert({
           id: updatedOrder.user_id,
           first_order_discount_used: true
       }, { onConflict: 'id' });
       
       if (profileError) {
           console.error("❌ WEBHOOK: Failed to update user profile discount flag:", profileError.message);
       } else {
           console.log("✅ WEBHOOK: First order discount flag permanently consumed for user:", updatedOrder.user_id);
       }
    }

    return NextResponse.json({ status: "ok" });
  } catch (err: any) {
    console.error("❌ WEBHOOK: Unexpected error:", err?.message || err);
    return NextResponse.json(
      { error: "Internal webhook error" },
      { status: 500 }
    );
  }
}
