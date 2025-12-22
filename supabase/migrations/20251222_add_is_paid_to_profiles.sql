-- Migration to add is_paid flag to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE;

-- Ensure RLS policies allow reading is_paid
-- (Assuming profiles table already has standard RLS)
