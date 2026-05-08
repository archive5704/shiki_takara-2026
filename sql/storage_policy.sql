-- Storage画像アップロード用 policy 再設定
-- 既に作成済みでも再実行できます。

drop policy if exists "public read treasure-images" on storage.objects;
create policy "public read treasure-images"
on storage.objects
for select
to public
using (bucket_id = 'treasure-images');

drop policy if exists "admin upload treasure-images" on storage.objects;
create policy "admin upload treasure-images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'treasure-images'
  and exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "admin update treasure-images" on storage.objects;
create policy "admin update treasure-images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'treasure-images'
  and exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
)
with check (
  bucket_id = 'treasure-images'
  and exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "admin delete treasure-images" on storage.objects;
create policy "admin delete treasure-images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'treasure-images'
  and exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);
