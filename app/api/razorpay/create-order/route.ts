import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

// ─── SIMPLE IN-MEMORY RATE LIMITER ───
// Maps IP to { count, resetTime }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const WINDOW_MS = 60 * 1000; // 1 minute
  const MAX_CALLS = 10; // Practical limit for production users

  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || entry.resetTime < now) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return true; // Allowed
  }

  if (entry.count >= MAX_CALLS) {
    return false; // Rate limited
  }

  entry.count += 1;
  return true; // Allowed
}
// ───────────────────────────────────────

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // Check Rate Limit based on simplistic IP tracking
    const ip = req.headers.get("x-forwarded-for") || req.ip || "unknown-ip";
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { items, order_id } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0 || items.length > 50) {
      return NextResponse.json(
        { error: "Invalid or overly large items array" },
        { status: 400 }
      );
    }

    if (!order_id) {
      return NextResponse.json(
        { error: "Missing required order_id for validation" },
        { status: 400 }
      );
    }

    // 1. Fetch legitimate prices from DB for the provided items
    const ids = items.map((i: any) => i.id).filter(Boolean);
    if (ids.length === 0) {
      return NextResponse.json({ error: "Cart items must have a valid ID" }, { status: 400 });
    }

    const { data: menuItems, error: dbError } = await supabase
      .from("menu_items")
      .select("id, name, price")
      .in("id", ids);

    if (dbError || !menuItems || menuItems.length === 0) {
      console.error("❌ SUPABASE FETCH ERROR:", dbError);
      return NextResponse.json(
        { error: "Failed to validate item prices" },
        { status: 500 }
      );
    }

    // 2. Calculate the true total based solely on DB prices
    let calculatedTotal = 0;
    for (const clientItem of items) {
      const dbItem = menuItems.find((m) => m.id === clientItem.id);
      if (!dbItem) {
        console.error(`Item not found in DB: ID ${clientItem.id} (${clientItem.name})`);
        return NextResponse.json(
          { error: `Invalid item in cart: ${clientItem.name}` },
          { status: 400 }
        );
      }
      if (clientItem.quantity <= 0) {
        return NextResponse.json(
          { error: `Invalid quantity for ${clientItem.name}` },
          { status: 400 }
        );
      }
      calculatedTotal += Number(dbItem.price) * clientItem.quantity;
    }

    if (calculatedTotal <= 0) {
      return NextResponse.json(
        { error: "Order total must be greater than zero" },
        { status: 400 }
      );
    }

    // Ensure we fetch `user_id` from the created order to securely determine discount eligibility
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('total_price, user_id')
      .eq('id', order_id)
      .single();

    if (orderError || !orderData) {
      return NextResponse.json(
        { error: "Could not find corresponding Supabase order" },
        { status: 400 }
      );
    }

    // 3. SECURE DISCOUNT CALCULATION
    let finalPayable = calculatedTotal;
    let isDiscountApplied = false;

    if (calculatedTotal >= 1299 && orderData.user_id) {
      // Only allow discount if they explicitly haven't used it
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('first_order_discount_used')
        .eq('id', orderData.user_id)
        .maybeSingle();

      if (!profile?.first_order_discount_used) {
        const discount = Math.floor(calculatedTotal * 0.10);
        finalPayable = calculatedTotal - discount;
        isDiscountApplied = true;
        console.log(`✅ First order discount applied for ${orderData.user_id}! Saved ${discount}. Final: ${finalPayable}`);
      }
    }

    // 4. Force Update Order with SECURE Total
    if (Number(orderData.total_price) !== finalPayable) {
      console.log(`Mismatch detected! Updating order ${order_id} total to secure calculated amount: ${finalPayable}`);
      const { error: updateError } = await supabase
        .from('orders')
        .update({ total_price: finalPayable }) // Overwrite client's naive total
        .eq('id', order_id);

      if (updateError) {
        console.error("Failed to force update order with secure total:", updateError);
      }
    }

    // 5. Create Razorpay Payment Object
    const rpOrder = await razorpay.orders.create({
      amount: finalPayable * 100, // Convert to paise securely using final amount
      currency: "INR",
      receipt: `order_${Date.now()}`,
    });

    // 6. Securely store the razorpay_order_id inside the Supabase order
    const { error: linkError } = await supabase
      .from('orders')
      .update({ razorpay_order_id: rpOrder.id })
      .eq('id', order_id);

    if (linkError) {
      console.error("Failed to link razorpay_order_id to Supabase order:", linkError);
    }

    return NextResponse.json({
      order_id: rpOrder.id,
      amount: rpOrder.amount, // returning the secure calculated amount
      currency: rpOrder.currency,
      secure_total: finalPayable,
      discount_applied: isDiscountApplied
    });
  } catch (err: any) {
    console.error("❌ RAZORPAY CREATE ORDER ERROR:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
}

