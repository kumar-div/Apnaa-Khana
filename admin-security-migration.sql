-- =================================================
-- SECURE ROLES MIGRATION: Run this in Supabase SQL Editor
-- Creates a secure roles table to fix the user_metadata vulnerability
-- =================================================

-- 1. Create the user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'customer'
);

-- 2. Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Users can only read their own role
CREATE POLICY "Users can read own role"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Optional Policy: Admins can read all roles
CREATE POLICY "Admins can read all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Create a secure helper function for checking admin status inside RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 5. UPDATE EXISTING ORDERS POLICIES to use the new secure function

-- Drop the old insecure policies (which relied on user_metadata)
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;

-- Recreate policy: Users can view their own orders OR admins can view all
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.is_admin()
  );

-- Recreate policy: Users can update their own orders OR admins can update all
CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id
    OR public.is_admin()
  )
  WITH CHECK (
    auth.uid() = user_id
    OR public.is_admin()
  );

-- =================================================
-- HOW TO MAKE A USER AN ADMIN:
-- Run this command in your Supabase SQL Editor, replacing the UUID
-- with your actual admin's user ID (found in Authentication > Users):
--
-- INSERT INTO public.user_roles (user_id, role) 
-- VALUES ('replace-with-your-uuid-here', 'admin') 
-- ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
-- =================================================
