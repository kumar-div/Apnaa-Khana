import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendStatusUpdateEmail } from "@/lib/email";
import type { OrderStatus, Order } from "@/data/orders";

// Service role client bypasses RLS — used ONLY for server-side admin verification
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Anon client for user-scoped token validation
const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No authorization header" }, { status: 401 });
    }

    const { orderId, status } = await req.json();
    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing orderId or status" }, { status: 400 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Secure Admin check — uses service role to bypass RLS on user_roles
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || roleData?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    // Admin is verified — use service role client for order operations (bypasses RLS)
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (updateError) throw updateError;

    // Fetch the updated order to send email
    const { data: orderData, error: fetchError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (!fetchError && orderData) {
      // We need the email address of the customer.
      // Since it's not stored in the `orders` table directly, we query auth? 
      // Wait, Admin RLS might let us query `auth.users`? No, auth.users is hidden.
      // Wait, in Razorpay Webhook, we captured it from webhook.
      // What if we don't have the customer email here?
      // A common pattern is to just save `customer_email` in the `orders` table. 
      // Yes, we will check if it exists or silently skip sending email.
      // For now, if we have it, we send. The user might need a tiny SQL migration later to add `customer_email`, but I will try to fetch it if it exists.
      
      const emailToSendTo = orderData.customer_email; // We will assume it might be there eventually, or skip safely.
      if (emailToSendTo) {
         await sendStatusUpdateEmail(orderData as Order, emailToSendTo);
      } else {
         console.log("No customer_email on order row, skipping Resend update email.");
      }
    }

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    console.error("❌ STATUS UPDATE ERROR:", error);
    return NextResponse.json({ error: error.message || "Failed to update status" }, { status: 500 });
  }
}
