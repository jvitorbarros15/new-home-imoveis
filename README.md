# New Home Imóveis

Portuguese-language real-estate website for New Home Imóveis (Barra da Tijuca, Rio de Janeiro): public listing search, property pages, WhatsApp lead flows, a financing estimator and a Supabase-backed admin area.

While `NH.isDemo` is `true` in `v1/company.js` the site shows the demo banner and demo footer wording and is served `noindex`. Switching to the real company is a data change in that file (name, CRECI, CNPJ, phones, address) plus the crawler settings; see the launch plan kept outside this repository.

## Stack

- Static site in `v1/`: plain HTML, CSS and JSX compiled per page with esbuild (`scripts/build.mjs`). React 18 and supabase-js are bundled from npm; there are no CDN scripts.
- Supabase: Postgres with Row Level Security, Auth (password + TOTP), Storage for listing photos.
- Vercel: static hosting, clean URLs, security headers, `api/imovel.js` for per-listing share metadata, optional Web Analytics.
- Browser verifier: `scripts/verify-browser.mjs` (Playwright + axe) with a mocked Supabase backend.

```text
api/imovel.js           Serves /imovel with per-listing Open Graph metadata (404 for unknown codes)
templates/imovel.html   Shell used by that function (copied to v1/imovel.html for local dev)
scripts/build.mjs       Production bundle build and deploy-time HTML rewrites
scripts/verify-browser.mjs   Browser verifier and live smoke test
v1/                     Static site and JSX source (v1/dist is generated)
supabase/migrations/    Database, Storage and RLS setup, applied in order
.github/workflows/ci.yml     Build and verifier on pull requests and pushes to main
```

## Local development

Requirements: Node.js 20 or newer.

```bash
npm install
cp .env.example .env          # optional: only needed to talk to a real Supabase project
npm run dev                   # builds (reads .env if present) and serves v1 at http://localhost:8080
```

`npm run dev` does not watch files: re-run it after editing a `.jsx` file.

Open the URL printed by `serve` and rebuild after editing any `.jsx` or `.js` source. Without Supabase variables the site still loads; data-driven areas show their empty or unconfigured states. `v1/config.js`, `v1/imovel.html` and `v1/dist/` are generated and not tracked.

Run the verifier against the local server (start `npx serve -l 8080 v1` first):

```bash
npm run build
node scripts/verify-browser.mjs        # exits non-zero on any failure
```

## Environment variables

Set these in the Vercel project (and in `.env` locally). Only public values belong here; never put a service-role key in a frontend variable.

| Variable | Purpose |
|---|---|
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Public Supabase connection. Required for Vercel builds (the build fails without them). Written to `v1/config.js`. |
| `TURNSTILE_SITE_KEY` | Optional Cloudflare Turnstile site key for the admin login. |
| `SITE_URL` | Absolute production origin, no trailing slash. Defaults to the Vercel preview address. |

`SITE_URL` is injected into `config.js` (read by `company.js`), into the canonical, `og:url` and `og:image` tags of `v1/*.html`, and into the `/imovel` template at request time.

### Deploy-time rewrites

When `VERCEL` is set, `scripts/build.mjs` also:

- appends `?v=<content hash>` to every `dist/*.js` script tag in `v1/*.html` and `templates/imovel.html`, so `/dist` can be cached as immutable;
- replaces the default site origin in `v1/*.html` with `SITE_URL`.

Both rewrites are idempotent and are skipped locally, so tracked files stay clean. If you run a Vercel-style build locally, revert the HTML files afterwards with `git checkout`.

## Database migrations

Apply every file in `supabase/migrations/` in numeric order, either by pasting each into the Supabase SQL editor or with the Supabase CLI against the target project. There is no `002`; the numbering gap is intentional. Review `009` before running it on existing data because it normalises and deletes invalid legacy rows.

| File | What it does |
|---|---|
| `001_properties.sql` | Creates the `properties` table and its base indexes. |
| `003_admin_policies.sql` | Anonymous visitors read only active listings; authenticated users read all. |
| `004_storage.sql` | Creates the public `property-images` bucket with MIME allowlist and size limit. |
| `005_extra_columns.sql` | Adds address, suites, pet-friendly, condominium and IPTU columns. |
| `006_admin_authorization.sql` | Adds `admin_users` and `public.is_admin()`; writes are limited to admins. |
| `007_data_integrity.sql` | Adds indexes and CHECK constraints (added as `NOT VALID`). |
| `008_drop_documents.sql` | Removes the unused document store, defensively. |
| `009_validate_constraints.sql` | Normalises legacy rows and validates the `007` constraints. |
| `010_leads_events_featured.sql` | Adds `leads`, `events` (anonymous insert, admin read/delete) and the featured flag. |
| `011_property_purpose.sql` | Adds sale/rent `purpose` and `updated_at`. |
| `012_lead_fields.sql` | Lead kind, property code, UTM and consent fields; email becomes optional; column-level insert grants. |
| `013_hide_address.sql` | Anonymous visitors can no longer read the exact address column. |
| `014_admin_aal2.sql` | Admins with a verified TOTP factor must present an `aal2` session. |
| `015_lead_status.sql` | Adds the lead `status` column and an admin-only status update policy. |
| `016_admin_metrics.sql` | Adds `public.admin_event_stats(days)` for the admin Métricas view; admin-only. |

Until `015` and `016` are applied the admin UI degrades gracefully: the status selector is hidden and the metrics view aggregates the latest 5,000 events in the browser.

## Admin setup

1. Create the administrator in Supabase *Authentication → Users*.
2. Copy the user UUID and run in the SQL editor:

   ```sql
   insert into public.admin_users (user_id) values ('YOUR-AUTH-USER-UUID');
   ```

3. Open `/admin`, sign in, then go to *Segurança* and enrol an authenticator app (TOTP). From the next sign-in the account needs the second factor.
4. In the Supabase dashboard enable Turnstile under *Authentication → Attack Protection* and set `TURNSTILE_SITE_KEY` to the matching site key.

Admin areas: *Imóveis* (listings, photos), *Contatos* (leads with filters, search, status and CSV export), *Métricas* (traffic and leads), *Segurança* (two-factor).

## Security posture

- Content Security Policy, HSTS, `frame-ancestors`, `X-Content-Type-Options` and a restrictive `Permissions-Policy` on every route (`vercel.json`).
- `script-src 'self'`: every script is bundled; the optional Vercel Web Analytics script is same-origin (`/_vercel/insights/script.js`).
- Row Level Security on `properties`, `leads`, `events`, `admin_users` and Storage; every write goes through `public.is_admin()`.
- Visitors can insert `leads` and `events` and read nothing back.
- Uploads are re-encoded to WebP in the browser, and the bucket enforces its own limits.

## Continuous integration and smoke test

`.github/workflows/ci.yml` runs on pull requests and pushes to `main`: `npm ci`, `npm run build`, Playwright Chromium install, a static server on port 8080 and the verifier.

To check a real deployment without mocks or test data:

```bash
VERIFY_LIVE=1 VERIFY_URL=https://your-domain.example npm run smoke
# optionally also open a real listing page:
VERIFY_LIVE=1 VERIFY_URL=https://your-domain.example VERIFY_PROPERTY_CODE=AP0001-NHB npm run smoke
```

Live mode uses the real `config.js` and Supabase, skips checks that submit leads or need fixture listings, and still verifies status codes, runtime errors, accessibility (axe), horizontal overflow at 320 px, the chat and the mobile menu. Chrome or Edge is used when found locally, otherwise Playwright's Chromium (`npx playwright-core install chromium`).

## Deploy and rollback

- Deploys come from Vercel's Git integration: each pull request gets a preview, the production branch is promoted automatically. Make sure the environment variables above exist for both Preview and Production.
- `vercel.json` runs `npm run build`, serves `v1/`, enables clean URLs, rewrites `/imovel` to `api/imovel.js` and sets cache headers: bundles requested with `?v=` are cached for a year, other `/dist` requests for ten minutes.
- Roll back from the Vercel dashboard by promoting a previous deployment (instant, no rebuild). Migrations are not rolled back with a deployment, so keep each one backwards compatible with the previous release.
- After every production deploy run the live smoke test above.
