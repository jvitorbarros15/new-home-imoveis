-- Only users explicitly listed here may manage content.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "admin users read self" on public.admin_users;
create policy "admin users read self" on public.admin_users
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "anon read active" on public.properties;
drop policy if exists "admin read all" on public.properties;
drop policy if exists "admin insert" on public.properties;
drop policy if exists "admin update" on public.properties;
drop policy if exists "admin delete" on public.properties;

create policy "anon read active" on public.properties
  for select to anon
  using (status = 'active');

create policy "admin read all" on public.properties
  for select to authenticated
  using (public.is_admin());

create policy "admin insert" on public.properties
  for insert to authenticated
  with check (public.is_admin());

create policy "admin update" on public.properties
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin delete" on public.properties
  for delete to authenticated
  using (public.is_admin());

drop policy if exists "public read" on public.documents;
drop policy if exists "admin read documents" on public.documents;
drop policy if exists "admin insert documents" on public.documents;
drop policy if exists "admin update documents" on public.documents;
drop policy if exists "admin delete documents" on public.documents;

create policy "admin read documents" on public.documents
  for select to authenticated using (public.is_admin());
create policy "admin insert documents" on public.documents
  for insert to authenticated with check (public.is_admin());
create policy "admin update documents" on public.documents
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete documents" on public.documents
  for delete to authenticated using (public.is_admin());

drop policy if exists "admin upload images" on storage.objects;
drop policy if exists "admin delete images" on storage.objects;
drop policy if exists "admin update images" on storage.objects;

create policy "admin upload images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'property-images' and public.is_admin());
create policy "admin update images" on storage.objects
  for update to authenticated
  using (bucket_id = 'property-images' and public.is_admin())
  with check (bucket_id = 'property-images' and public.is_admin());
create policy "admin delete images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'property-images' and public.is_admin());

-- After creating the first user in Supabase Auth, authorize it once:
-- insert into public.admin_users (user_id) values ('AUTH-USER-UUID');
