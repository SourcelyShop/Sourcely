-- Create wishlist table
create table if not exists public.wishlist (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    asset_id uuid references public.asset_listings(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, asset_id)
);

-- Enable RLS
alter table public.wishlist enable row level security;

-- Policies
create policy "Users can view their own wishlist"
    on public.wishlist for select
    using (auth.uid() = user_id);

create policy "Users can add to their own wishlist"
    on public.wishlist for insert
    with check (auth.uid() = user_id);

create policy "Users can remove from their own wishlist"
    on public.wishlist for delete
    using (auth.uid() = user_id);
