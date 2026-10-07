alter table public.leads
  add column if not exists kind text not null default 'contact',
  add column if not exists property_code text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists referrer text,
  add column if not exists consent_at timestamptz,
  add column if not exists consent_version text;

alter table public.leads alter column email drop not null;

alter table public.leads
  drop constraint if exists leads_kind_valid,
  drop constraint if exists leads_phone_e164,
  drop constraint if exists leads_email_len,
  drop constraint if exists leads_source_path_len,
  drop constraint if exists leads_attribution_len,
  add constraint leads_kind_valid check (kind in ('contact', 'visit', 'seller')),
  add constraint leads_phone_e164 check (phone ~ '^\+55[0-9]{10,11}$') not valid,
  add constraint leads_email_len check (email is null or char_length(email) between 5 and 200),
  add constraint leads_source_path_len check (source_path is null or char_length(source_path) <= 200),
  add constraint leads_attribution_len check (
    (property_code is null or char_length(property_code) <= 32) and
    (utm_source is null or char_length(utm_source) <= 100) and
    (utm_medium is null or char_length(utm_medium) <= 100) and
    (utm_campaign is null or char_length(utm_campaign) <= 100) and
    (referrer is null or char_length(referrer) <= 300) and
    (consent_version is null or char_length(consent_version) <= 40)
  );

-- id and created_at are server-owned: visitors may not choose them.
revoke insert on public.leads from anon, authenticated;
grant insert (
  name, phone, email, interest, message, source_path, kind, property_code,
  utm_source, utm_medium, utm_campaign, referrer, consent_at, consent_version
) on public.leads to anon, authenticated;
