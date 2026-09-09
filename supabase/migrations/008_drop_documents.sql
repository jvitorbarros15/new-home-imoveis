-- The pgvector document store was never used by the site. Removing it deletes
-- an anonymous-readable table and an unused database function.
-- Written defensively so it is a no-op on installations that never had it.
do $$
declare
  fn record;
begin
  for fn in
    select oid::regprocedure as sig
    from pg_proc
    where pronamespace = 'public'::regnamespace and proname = 'match_documents'
  loop
    execute format('drop function %s', fn.sig);
  end loop;
end
$$;

drop table if exists public.documents;
