-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT exists(
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND is_admin = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Policy for Admins to view all messages
CREATE POLICY "Admins can view all messages"
ON public.support_messages
FOR SELECT
TO authenticated
USING (
  is_admin()
);

-- Policy for Admins to view all tickets
CREATE POLICY "Admins can view all tickets"
ON public.support_tickets
FOR SELECT
TO authenticated
USING (
  is_admin()
);
