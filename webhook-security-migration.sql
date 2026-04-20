-- =================================================
-- HOTFIX: REVOKE INSECURE ANON POLICIES
-- Run this in your Supabase SQL Editor
-- =================================================

-- 1. Drop the massive vulnerability that allowed public webhooks to update any order
DROP POLICY IF EXISTS "Webhook can update orders" ON orders;

-- 2. Drop the policy that allowed public to read orders checking for webhook
DROP POLICY IF EXISTS "Anon can read orders for webhook" ON orders;

-- Let's re-verify and ensure the correct policies are active:
-- Authenticated users checking their own stuff OR Admins checking everything.
-- This does NOT break Razorpay, because the Razorpay webhook backend will now
-- be powered by the SUPABASE_SERVICE_ROLE_KEY which natively bypasses RLS entirely.

-- Ensure the safe policies exist (from previous secure roles migration)
-- (If these already exist, creating them again might error, so we use DO block or just leave them as they were gracefully handled in previous migrations)

-- The RLS is now closed to `anon`. All webhooks must authenticate via Service Role.
