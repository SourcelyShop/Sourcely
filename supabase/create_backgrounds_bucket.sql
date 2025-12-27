-- Create the storage bucket for backgrounds
insert into storage.buckets (id, name, public)
values ('backgrounds', 'backgrounds', true)
on conflict (id) do nothing;

-- Set up RLS policies for the backgrounds bucket
create policy "Backgrounds are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'backgrounds' );

create policy "Users can upload their own backgrounds"
  on storage.objects for insert
  with check ( bucket_id = 'backgrounds' and auth.role() = 'authenticated' );

create policy "Users can update their own backgrounds"
  on storage.objects for update
  using ( bucket_id = 'backgrounds' and auth.uid() = owner );

create policy "Users can delete their own backgrounds"
  on storage.objects for delete
  using ( bucket_id = 'backgrounds' and auth.uid() = owner );
