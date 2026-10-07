alter table public.leads
  add column if not exists status text not null default 'novo';

alter table public.leads
  drop constraint if exists leads_status_valid,
  add constraint leads_status_valid check (status in ('novo', 'contatado', 'visita', 'fechado', 'perdido'));

-- Only the status column may be edited; every other column stays immutable.
revoke update on public.leads from anon, authenticated;
grant update (status) on public.leads to authenticated;

drop policy if exists "admin update lead status" on public.leads;
create policy "admin update lead status" on public.leads
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());
