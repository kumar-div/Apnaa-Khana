-- =================================================
-- ADDRESS MIGRATION: Run this in Supabase SQL Editor
-- Adds physical delivery fields to orders for real delivery
-- =================================================

DO $$
BEGIN
  -- Add phone_number if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN phone_number TEXT;
  END IF;

  -- Add delivery_address if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'delivery_address'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN delivery_address TEXT;
  END IF;
END $$;
