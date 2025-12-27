alter table public.asset_listings
add column if not exists deletion_scheduled_at timestamp with time zone;
