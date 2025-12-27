-- Add subscription_interval column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_interval TEXT CHECK (subscription_interval IN ('month', 'year'));
