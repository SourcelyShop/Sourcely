-- Add image_url column to asset_listings
alter table public.asset_listings
add column if not exists image_url text;

-- Create storage bucket for product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Policy: Anyone can view product images
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'product-images' );

-- Policy: Authenticated users can upload product images
create policy "Authenticated users can upload"
on storage.objects for insert
with check (
  bucket_id = 'product-images'
  and auth.role() = 'authenticated'
);

-- Policy: Users can update their own images
create policy "Users can update own images"
on storage.objects for update
using (
  bucket_id = 'product-images'
  and auth.uid() = owner
);

-- Policy: Users can delete their own images
create policy "Users can delete own images"
on storage.objects for delete
using (
  bucket_id = 'product-images'
  and auth.uid() = owner
);
