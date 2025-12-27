-- Add is_admin column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create a policy to allow admins to view all data (optional, but good for client-side if needed later)
-- For now, we will rely on the service role in server actions for admin stats.

-- Update the handle_new_user function to include is_admin if we want to set it on signup (usually we don't, but good to know)
-- We'll keep it simple for now and just add the column.
