-- Featured flag drives ordering of the home page selection.
alter table public.properties
  add column if not exists featured boolean not null default false;

create index if not exists properties_featured_idx
  on public.properties(featured desc, created_at desc);

-- Contact requests are persisted before the WhatsApp hand-off so a lead is
-- never lost when the visitor abandons the conversation.
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text not null,
  email       text not null,
  interest    text,
  message     text,
  source_path text,
  created_at  timestamptz not null default now(),
  constraint leads_name_len     check (char_length(name) between 1 and 120),
  constraint leads_phone_len    check (char_length(phone) between 6 and 40),
  constraint leads_email_len    check (char_length(email) between 5 and 200),
  constraint leads_interest_len check (interest is null or char_length(interest) <= 60),
  constraint leads_message_len  check (message is null or char_length(message) <= 2000)
);

alter table public.leads enable row level security;

drop policy if exists "anon submit lead" on public.leads;
create policy "anon submit lead" on public.leads
  for insert to anon with check (true);

drop policy if exists "auth submit lead" on public.leads;
create policy "auth submit lead" on public.leads
  for insert to authenticated with check (true);

drop policy if exists "admin read leads" on public.leads;
create policy "admin read leads" on public.leads
  for select to authenticated using (public.is_admin());

drop policy if exists "admin delete leads" on public.leads;
create policy "admin delete leads" on public.leads
  for delete to authenticated using (public.is_admin());

create index if not exists leads_created_at_idx on public.leads(created_at desc);

-- Anonymous conversion counters. Contains no personal data.
create table if not exists public.events (
  id            bigint primary key generated always as identity,
  name          text not null,
  path          text,
  property_code text,
  detail        text,
  created_at    timestamptz not null default now(),
  constraint events_name_len   check (char_length(name) between 1 and 64),
  constraint events_path_len   check (path is null or char_length(path) <= 200),
  constraint events_code_len   check (property_code is null or char_length(property_code) <= 32),
  constraint events_detail_len check (detail is null or char_length(detail) <= 200)
);

alter table public.events enable row level security;

drop policy if exists "anon write event" on public.events;
create policy "anon write event" on public.events
  for insert to anon with check (true);

drop policy if exists "auth write event" on public.events;
create policy "auth write event" on public.events
  for insert to authenticated with check (true);

drop policy if exists "admin read events" on public.events;
create policy "admin read events" on public.events
  for select to authenticated using (public.is_admin());

create index if not exists events_created_at_idx on public.events(created_at desc);
create index if not exists events_name_idx on public.events(name, created_at desc);
