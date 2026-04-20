-- =================================================
-- REVIEWS MIGRATION: User Authentication & Ownership
-- Run this in Supabase SQL Editor
-- =================================================

-- 1. Add user_id column if missing, linked to auth.users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.reviews ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2. Add an explicit unique constraint so a user can only have one review
-- Note: Requires clearing out potential duplicates first if they exist, but for a new setup it's robust.
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'reviews_user_id_key'
  ) THEN
    -- If there's duplicate user_ids already (highly unlikely for current state), 
    -- you'd want to handle them, but assuming fresh schema constraints:
    -- We delete null user_ids if they want strictly authenticated reviews from now on 
    -- OR we just enforce unique on non-null user_ids.
    ALTER TABLE public.reviews ADD CONSTRAINT reviews_user_id_key UNIQUE (user_id);
  END IF; 
END $$;

-- 3. Update Row Level Security Policies
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop any old policies
DROP POLICY IF EXISTS "Allow insert reviews" ON reviews;
DROP POLICY IF EXISTS "Allow select reviews" ON reviews;
DROP POLICY IF EXISTS "Users can insert own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
DROP POLICY IF EXISTS "Public can view reviews" ON reviews;

-- Allow public read access to all reviews
CREATE POLICY "Public can view reviews"
  ON public.reviews FOR SELECT TO public
  USING (true);

-- Allow authenticated users to insert their own review
CREATE POLICY "Users can insert own reviews"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update ONLY their own review
CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete ONLY their own review
CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
