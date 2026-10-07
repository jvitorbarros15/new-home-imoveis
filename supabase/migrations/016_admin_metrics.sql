-- Aggregated traffic and lead statistics for the admin Métricas view.
-- Runs as the table owner but refuses anyone who is not an administrator.
create or replace function public.admin_event_stats(days int default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  since timestamptz;
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  days := least(greatest(coalesce(days, 30), 1), 365);
  since := now() - make_interval(days => days);

  select jsonb_build_object(
    'days', days,
    'page_views', (
      select count(*) from public.events
      where name = 'property_view' and created_at >= since
    ),
    'top_listings', coalesce((
      select jsonb_agg(t) from (
        select property_code as code, count(*) as views
        from public.events
        where name = 'property_view' and property_code is not null and created_at >= since
        group by property_code order by count(*) desc limit 10
      ) t
    ), '[]'::jsonb),
    'clicks_per_day', coalesce((
      select jsonb_agg(t order by t.day) from (
        select to_char(created_at at time zone 'America/Sao_Paulo', 'YYYY-MM-DD') as day,
               count(*) filter (where name = 'whatsapp_click') as whatsapp,
               count(*) filter (where name = 'phone_click') as phone
        from public.events
        where name in ('whatsapp_click', 'phone_click') and created_at >= since
        group by 1
      ) t
    ), '[]'::jsonb),
    'leads_per_day', coalesce((
      select jsonb_agg(t order by t.day) from (
        select to_char(created_at at time zone 'America/Sao_Paulo', 'YYYY-MM-DD') as day,
               count(*) as total
        from public.leads where created_at >= since
        group by 1
      ) t
    ), '[]'::jsonb),
    'leads_by_kind', coalesce((
      select jsonb_object_agg(kind, total) from (
        select kind, count(*) as total from public.leads where created_at >= since group by kind
      ) t
    ), '{}'::jsonb),
    'leads_by_source', coalesce((
      select jsonb_agg(t) from (
        select coalesce(utm_source, 'direto') as source, count(*) as count
        from public.leads where created_at >= since
        group by 1 order by count(*) desc limit 10
      ) t
    ), '[]'::jsonb),
    'chat_completions', (
      select count(*) from public.events where name = 'chat_complete' and created_at >= since
    ),
    'js_errors', (
      select count(*) from public.events where name = 'js_error' and created_at >= since
    )
  ) into result;

  return result;
end;
$$;

revoke all on function public.admin_event_stats(int) from public;
grant execute on function public.admin_event_stats(int) to authenticated;
