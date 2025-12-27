-- Create the waitlist table
create table if not exists waitlist (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table waitlist enable row level security;

-- Create policies
-- Allow anyone (anon) to insert their email
create policy "Anyone can join the waitlist"
  on waitlist for insert
  with check (true);

-- Only allow admins/service role to view the waitlist (or maybe just count for public?)
-- For now, we'll allow public to read ONLY the count (which is done via a separate function or just restricted select if needed, but for simplicity let's allow public read for now to get the count easily, or better, create a secure function to get count)

-- Actually, allowing public select on emails is bad.
-- Let's create a policy that allows selecting ONLY if you are an admin, 
-- BUT we need the count for the landing page.
-- A common pattern is to use a Postgres function to get the count securely without exposing rows.

create or replace function get_waitlist_count()
returns integer
language sql
security definer
as $$
  select count(*)::integer from waitlist;
$$;

-- Grant execute permission to anon
grant execute on function get_waitlist_count to anon, authenticated;

-- Policy for reading: Only service role or admins (if we had an admin role set up fully)
-- For now, let's just say no public select on the table itself.
create policy "Service role can do everything"
  on waitlist
  using ( auth.role() = 'service_role' );
