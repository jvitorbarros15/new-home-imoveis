# New Home Imóveis

Responsive Portuguese-language real-estate experience for discovering, filtering, and managing property listings.

[Live demo](https://new-home-imoveis.vercel.app) · [Portfolio](https://joao-vitor-barros-da-silva-portfoli.vercel.app)

![New Home Imóveis landing page](docs/preview.jpg)

## What it demonstrates

- Mobile-friendly property discovery and listing detail flows
- Supabase-backed authentication and listing data
- Administrative screens for content and media management
- Conversion paths designed around WhatsApp contact
- A lightweight React implementation that can be served as static assets

## Stack

React 18, React Router, Tailwind CSS, Supabase, and browser-native JavaScript. The current portfolio build lives in `v1/` and loads its runtime dependencies from CDNs.

## Run locally

Requirements: Python 3 (or any static file server).

```bash
cd v1
python -m http.server 8080
```

Open <http://localhost:8080>. No build step is required.

## Configuration

The public deployment runs cleanly with sample properties and no database dependency. To enable live listings and the admin workflow, set `supabaseUrl` and `supabaseAnonKey` in `v1/config.js`.

Supabase anonymous keys are designed for client use, but database Row Level Security policies must enforce access control. Service-role keys must never be added to browser code or committed.

## Repository structure

```text
v1/                 Static React application
v1/admin/           Administrative screens
v1/components/      Shared interface components
v1/data/            Demo property data
supabase/            Database configuration and migrations
docs/preview.jpg    Recruiter-facing product preview
```

This repository is a portfolio demonstration; property records and contact flows should be treated as sample data unless explicitly configured for production.
