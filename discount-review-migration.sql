-- =================================================
-- DISCOUNT & REVIEW PROMPT MIGRATION
-- Run this in Supabase SQL Editor
-- =================================================

-- 1. Create a user profiles table to store the discount flag centrally
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_order_discount_used BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON user_profiles;

CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- We only allow the service_role secret key to update this flag to prevent tampering
CREATE POLICY "Service role can manage profiles"
  ON public.user_profiles FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. Add review prompt flag to orders to track if they've been asked
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'review_prompt_seen'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN review_prompt_seen BOOLEAN DEFAULT false;
  END IF;
END $$;
