-- Administrators with a verified TOTP factor must present an aal2 session.
-- Administrators who have not enrolled yet keep password-only access, so
-- applying this migration cannot lock anyone out; enrolling a factor from the
-- admin Segurança view turns the requirement on for that account.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  )
  and (
    coalesce((select auth.jwt() ->> 'aal'), 'aal1') = 'aal2'
    or not exists (
      select 1 from auth.mfa_factors
      where user_id = (select auth.uid()) and status = 'verified'
    )
  );
$$;
