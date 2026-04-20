-- =================================================
-- Run this in Supabase SQL Editor to add Razorpay columns
-- This is SAFE — it only ADDs columns if they don't exist
-- It does NOT modify or drop anything existing
-- =================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'razorpay_order_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN razorpay_order_id TEXT DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'razorpay_payment_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN razorpay_payment_id TEXT DEFAULT NULL;
  END IF;
END $$;
