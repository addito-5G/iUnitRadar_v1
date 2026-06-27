# iUnitRadar — B2B SaaS Unit Economics Calculator

**Live demo:** [https://addito-5g.github.io/iUnitRadar_v1/](https://addito-5g.github.io/iUnitRadar_v1/)

Portfolio project for product analytics: model B2B SaaS unit economics end to end — MRR/ARR, retention, CAC, LTV, payback, gross margin, ROMI, Rule of 40, and a health score — with shareable scenario links.

**Product UI is in Russian** (Russian market). Metric names follow international conventions (MRR, NRR, LTV:CAC, etc.).

![iUnitRadar dashboard](Radar.png)

## Why this project exists

Built the way a PM uses product analytics in practice: turn monthly inputs into decision-ready metrics, validate data quality, compare scenarios, and share results before committing roadmap or budget decisions.

## Features

- **Full metric stack:** MRR/ARR, logo & revenue churn, GRR/NRR, CAC, LTV, payback, gross margin, ROMI, Rule of 40, health score
- **Demo scenario:** one-click load of a 3-month B2B SaaS sample (marketplace sellers context)
- **Shareable scenarios:** unique URLs (`?calc=<uuid>`) backed by Supabase snapshots
- **Tested calculations:** unit tests on core metric functions (`npm test`)
- **Clean architecture:** pure calculation functions, separated UI, centralized state
- **Buildless:** vanilla ES modules — runs on GitHub Pages without a bundler

## Tech stack

- **Frontend:** Vanilla JS (ES modules), CSS
- **Backend:** Supabase (REST API + JSONB)
- **Deploy:** GitHub Pages

## Setup

1. Create a [Supabase](https://supabase.com/) project and run `supabase/schema.sql`.
2. Copy `config.example.js` to `config.js` and add your credentials.
3. Run locally: `npm start` or `npx serve .`
4. Run tests: `npm test`

Sharing works only when Supabase is configured. Everything else runs offline with local storage.

## Security note (Supabase)

The bundled `schema.sql` enables **public read/write for anonymous users** — intentional for a demo/portfolio deployment.

For production you should:

- add TTL or cleanup for old snapshots
- restrict RLS policies (e.g. insert-only with rate limits, or authenticated users)
- never store sensitive financial data in public snapshots

## Methodology notes

- **LTV** uses a simplified formula: `(ARPA × Gross Margin %) / Logo Churn Rate` — logo churn, not revenue churn.
- **ROMI** in the calculator is marketing efficiency based on LTV and CAC, not classic campaign-period ROMI.

See the in-app glossary (Справочник) for details and assumptions.

## Project structure

- `src/lib/` — calculations, validation, export, formatting
- `src/state/` — app store and local storage
- `src/features/` — dashboard UI, month editor, sharing
- `tests/` — unit tests for calculation logic

## Context

Independent rebuild of a unit economics workflow: transparent formulas, editable thresholds, import/export, and remote sharing without a custom backend.
