-- Apply only after /api/lead is deployed with SUPABASE_SERVICE_ROLE_KEY set and
-- verified end to end. Until then the site (and the local-dev fallback in
-- v1/lead.js) still inserts into public.leads with the anon key, and this
-- migration would break that path.
--
-- After this, leads can only be created by the server using the service-role
-- key, which bypasses RLS and grants.

revoke insert on public.leads from anon, authenticated;

drop policy if exists "anon submit lead" on public.leads;
drop policy if exists "auth submit lead" on public.leads;
