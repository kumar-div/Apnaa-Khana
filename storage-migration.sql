-- =================================================
-- STORAGE SETUP: Run this in Supabase SQL Editor
-- Creates the public bucket for menu images and sets Admin RLS
-- =================================================

-- 1. Create the 'menu-images' bucket (publicly readable)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public to read objects in this bucket
CREATE POLICY "Public Read Access for Menu Images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'menu-images');

-- 3. Allow only Admins (via user_roles table) to insert/upload images
CREATE POLICY "Admin Upload Access" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'menu-images' 
  AND public.is_admin()
);

-- 4. Allow only Admins to update images
CREATE POLICY "Admin Update Access" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'menu-images' 
  AND public.is_admin()
);

-- 5. Allow only Admins to delete images
CREATE POLICY "Admin Delete Access" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'menu-images' 
  AND public.is_admin()
);
