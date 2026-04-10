-- Supabase Storage bucket for site images
-- Run AFTER 0001_init.sql

-- Create public bucket
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

-- Policies for site-images bucket
create policy "site_images_public_read"
  on storage.objects for select
  using (bucket_id = 'site-images');

create policy "site_images_admin_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'site-images'
    and public.is_admin()
  );

create policy "site_images_admin_update"
  on storage.objects for update
  using (
    bucket_id = 'site-images'
    and public.is_admin()
  );

create policy "site_images_admin_delete"
  on storage.objects for delete
  using (
    bucket_id = 'site-images'
    and public.is_admin()
  );
