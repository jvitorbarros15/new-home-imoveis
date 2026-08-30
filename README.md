# New Home Imóveis

Responsive Portuguese-language real-estate website for New Home Imóveis, with public property pages, WhatsApp conversion flows, a financing estimator and a Supabase-backed administration area.

[Portfolio deployment](https://new-home-imoveis.vercel.app) · [Official New Home website](https://www.imoveisnewhome.com.br/)

## What is included

- Public home, company, financing and property-detail pages
- Verified company contact details and links to the official inventory
- Responsive navigation, accessible dialogs and keyboard-friendly controls
- Working WhatsApp contact, visit-request, share, favorite and print actions
- Supabase authentication, listings CRUD and image storage
- Row Level Security that limits writes to an explicit administrator allowlist
- Production JSX compilation with esbuild instead of Babel in the browser

## Run locally

Requirements: Node.js 20+.

```bash
npm install
npm run build
npx serve v1
```

Open the local URL printed by `serve`. Re-run `npm run build` after editing a JSX source file.

## Supabase setup

1. Create a Supabase project and run every SQL file in `supabase/migrations/` in numeric order.
2. Create the administrator in Supabase Authentication.
3. Copy that user's UUID and run:

```sql
insert into public.admin_users (user_id)
values ('YOUR-AUTH-USER-UUID');
```

4. Put the project URL and public anonymous key in `v1/config.js`.

The anonymous key is expected in browser code; a service-role key is not. Database and Storage policies are the security boundary. Never put a service-role key in this repository or in a frontend environment variable.

## Data behavior

The local default property is listing `AP9680-NHB`, using details checked against New Home's current advertising. Its gallery is explicitly labeled illustrative and links to the official listing for current photos and availability. Other database-backed property URLs fail safely instead of silently showing unrelated fallback content.

## Repository structure

```text
scripts/build.mjs       Production bundle build
v1/                     Static site and JSX source
v1/dist/                Generated bundles (ignored by Git)
supabase/migrations/    Database, Storage and RLS setup
```

## Deployment

`vercel.json` builds the bundles, serves `v1/`, enables clean URLs and adds baseline security headers. Configure the public Supabase values before deploying the admin workflow.
