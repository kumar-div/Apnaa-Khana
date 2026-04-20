-- =================================================
-- MENU ITEMS SECURITY MIGRATION: Lock down the menu
-- Run this in Supabase SQL Editor
-- =================================================

-- 1. Ensure RLS is enabled
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- 2. Drop the old insecure policies from initial setup
DROP POLICY IF EXISTS "Allow all menu for authenticated" ON menu_items;
DROP POLICY IF EXISTS "Allow insert menu for anon" ON menu_items;
DROP POLICY IF EXISTS "Allow update menu for anon" ON menu_items;
DROP POLICY IF EXISTS "Allow delete menu for anon" ON menu_items;

-- 3. Public read policy (already exists usually, but redefining for safety)
DROP POLICY IF EXISTS "Allow select menu" ON menu_items;
CREATE POLICY "Allow select menu"
  ON public.menu_items FOR SELECT TO public
  USING (true);

-- 4. Admin-only mutation policies (depends on public.is_admin() existing from admin-security-migration)
CREATE POLICY "Admins can insert menu"
  ON public.menu_items FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update menu"
  ON public.menu_items FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete menu"
  ON public.menu_items FOR DELETE TO authenticated
  USING (public.is_admin());
