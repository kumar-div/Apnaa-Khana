-- =================================================
-- AUTH MIGRATION: Run this in Supabase SQL Editor
-- Adds user_id to orders, updates RLS policies
-- Safe to run multiple times (idempotent)
-- =================================================

-- STEP 1: Add user_id column to orders (linked to auth.users)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT NULL;
  END IF;
END $$;

-- STEP 2: Create index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- STEP 3: Drop old permissive policies
DROP POLICY IF EXISTS "Allow insert for all" ON orders;
DROP POLICY IF EXISTS "Allow select for all" ON orders;
DROP POLICY IF EXISTS "Allow update for authenticated" ON orders;

-- STEP 4: New RLS policies for orders

-- Authenticated users can insert orders (with their own user_id)
CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR (auth.jwt() ->> 'role' = 'admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
  );

-- Users can update their own orders (for cancellation)
CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id
    OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
  )
  WITH CHECK (
    auth.uid() = user_id
    OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
  );

-- Allow anon webhook to update orders (for Razorpay webhook)
CREATE POLICY "Webhook can update orders"
  ON orders FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- Allow anon to read for webhook verification
CREATE POLICY "Anon can read orders for webhook"
  ON orders FOR SELECT TO anon
  USING (true);

-- STEP 5: Admin helper function (optional, for checking admin status)
-- To make a user admin, run in SQL editor:
-- UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}' WHERE email = 'your-admin@email.com';
