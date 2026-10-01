alter table public.properties
  add column if not exists purpose text not null default 'sale',
  add column if not exists updated_at timestamptz not null default now();

alter table public.properties
  drop constraint if exists properties_purpose_valid,
  add constraint properties_purpose_valid check (purpose in ('sale', 'rent'));

-- Rows already marked rented were rented out (or meant for rent). They stay
-- non-public; the purpose is recorded so an admin can decide to re-publish.
update public.properties set purpose = 'rent' where status = 'rented';

create index if not exists properties_purpose_idx on public.properties(purpose);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();
