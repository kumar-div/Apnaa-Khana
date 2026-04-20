-- =================================================
-- Run this ENTIRE script in Supabase SQL Editor
-- =================================================

-- STEP 1: Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  items JSONB NOT NULL,
  total_price NUMERIC NOT NULL DEFAULT 0,
  instructions TEXT DEFAULT '',
  payment_status TEXT DEFAULT 'pending',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- STEP 2: Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- STEP 3: Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL DEFAULT 'mains',
  image TEXT DEFAULT '',
  description TEXT DEFAULT '',
  is_popular BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- STEP 4: Enable RLS on all tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- STEP 5: Orders policies
DROP POLICY IF EXISTS "Allow insert for all" ON orders;
CREATE POLICY "Allow insert for all"
  ON orders FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow select for all" ON orders;
CREATE POLICY "Allow select for all"
  ON orders FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow update for authenticated" ON orders;
CREATE POLICY "Allow update for authenticated"
  ON orders FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- STEP 6: Reviews policies
DROP POLICY IF EXISTS "Allow insert reviews" ON reviews;
CREATE POLICY "Allow insert reviews"
  ON reviews FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow select reviews" ON reviews;
CREATE POLICY "Allow select reviews"
  ON reviews FOR SELECT TO anon, authenticated
  USING (true);

-- STEP 7: Menu items policies
DROP POLICY IF EXISTS "Allow select menu" ON menu_items;
CREATE POLICY "Allow select menu"
  ON menu_items FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow all menu for authenticated" ON menu_items;
CREATE POLICY "Allow all menu for authenticated"
  ON menu_items FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert menu for anon" ON menu_items;
CREATE POLICY "Allow insert menu for anon"
  ON menu_items FOR INSERT TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update menu for anon" ON menu_items;
CREATE POLICY "Allow update menu for anon"
  ON menu_items FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete menu for anon" ON menu_items;
CREATE POLICY "Allow delete menu for anon"
  ON menu_items FOR DELETE TO anon
  USING (true);

-- STEP 8: Enable realtime on orders table
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- STEP 9: Add status column if missing (safe for re-runs)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'status'
  ) THEN
    ALTER TABLE orders ADD COLUMN status TEXT DEFAULT 'pending';
  END IF;
END $$;
