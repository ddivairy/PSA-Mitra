-- Publicly served images are separate from confidential partner documents.
-- Writes are performed only by the authenticated server route using service role.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('program-media', 'program-media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']::text[])
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read program media" on storage.objects;
create policy "Public can read program media"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'program-media');

