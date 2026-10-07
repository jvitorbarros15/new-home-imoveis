-- The exact address is only for administrators and the team. Anonymous visitors
-- keep every other column; a plain "select *" now fails for them by design.
revoke select on public.properties from anon;
grant select (
  id, code, title, type, region, price_brl, area_m2, bedrooms, bathrooms, parking,
  description, tour_url, images, status, created_at, suites, pet_friendly,
  condominio_brl, iptu_brl, featured, purpose, updated_at
) on public.properties to anon;
