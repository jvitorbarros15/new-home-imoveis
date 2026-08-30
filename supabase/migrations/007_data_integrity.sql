create index if not exists properties_status_idx on public.properties(status);
create index if not exists properties_region_idx on public.properties(region);
create index if not exists properties_created_at_idx on public.properties(created_at desc);

alter table public.properties
  drop constraint if exists properties_status_valid,
  add constraint properties_status_valid
    check (status in ('active', 'sold', 'rented')) not valid,
  drop constraint if exists properties_price_positive,
  add constraint properties_price_positive
    check (price_brl > 0) not valid,
  drop constraint if exists properties_counts_nonnegative,
  add constraint properties_counts_nonnegative
    check (
      coalesce(area_m2, 0) >= 0 and
      coalesce(bedrooms, 0) >= 0 and
      coalesce(suites, 0) >= 0 and
      coalesce(bathrooms, 0) >= 0 and
      coalesce(parking, 0) >= 0 and
      coalesce(condominio_brl, 0) >= 0 and
      coalesce(iptu_brl, 0) >= 0
    ) not valid;
