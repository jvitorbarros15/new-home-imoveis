-- 007 added the CHECK constraints as NOT VALID, so existing rows were never
-- verified. Normalise the legacy rows, then validate.
update public.properties set status = 'active' where status not in ('active', 'sold', 'rented');
delete from public.properties where price_brl is null or price_brl <= 0;
update public.properties
  set area_m2        = nullif(greatest(coalesce(area_m2, 0), 0), 0),
      bedrooms       = greatest(coalesce(bedrooms, 0), 0),
      suites         = greatest(coalesce(suites, 0), 0),
      bathrooms      = greatest(coalesce(bathrooms, 0), 0),
      parking        = greatest(coalesce(parking, 0), 0),
      condominio_brl = greatest(coalesce(condominio_brl, 0), 0),
      iptu_brl       = greatest(coalesce(iptu_brl, 0), 0);

alter table public.properties validate constraint properties_status_valid;
alter table public.properties validate constraint properties_price_positive;
alter table public.properties validate constraint properties_counts_nonnegative;
