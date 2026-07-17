# FareAtlas

Australia-first travel intelligence: **loyalty offers**, **award seats**, and **cash fares** — so you know when to use points and when to pay dollars.

Inspired by products like Points Now, with a warmer product UI and an explicit cash-vs-points edge.

## Stack

| Layer | Choice |
| --- | --- |
| App | Next.js App Router + TypeScript |
| UI | Tailwind CSS v4 |
| Database | **Neon PostgreSQL** via Prisma |
| Awards | Seats.aero Partner API |
| Cash (next) | Amadeus |
| Hosting | Vercel |

## Features (MVP)

- Marketing home with programs, offers, award cabins, pricing Free / Premium
- `/offers` — Qantas, Velocity, Everyday Rewards, Flybuys catalogue (Neon + fallback)
- `/flights` — Seats.aero search, trip detail, cash watch, route alert capture
- `/pricing` — Free vs Premium (Stripe waitlist next)
- API: `/api/awards/*`, `/api/offers`, `/api/watches`
- **Daily Seats.aero cache** in Neon — identical searches reuse DB rows; table purged nightly (Sydney day)

### Award cache (save Seats.aero quota)

| Behaviour | Detail |
| --- | --- |
| Key | Hash of route + dates + filters + Sydney `dayKey` |
| Hit | Serve JSON from `AwardSearchCache` / `AwardTripCache` (no API call) |
| Miss | Call Seats.aero, store payload for the rest of the day |
| Cleanup | Vercel Cron `GET /api/cron/award-cache?mode=purge` at 14:05 UTC (~00:05 AEST) |
| Bypass | `?refresh=1` forces a live API call and rewrites the cache |

Requires `DATABASE_URL` + `CRON_SECRET` (recommended) on Vercel.

## Local setup

```bash
npm install
cp .env.example .env.local
# Add Neon DATABASE_URL + DIRECT_URL
# Add AWARD_AVAILABILITY_API_KEY for live award search

npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without `DATABASE_URL`, the app still runs using demo offers/cash data.

## Neon on Vercel

1. Vercel project → Storage / Integrations → **Neon**
2. Confirm env vars:
   - `DATABASE_URL` — pooled
   - `DIRECT_URL` — unpooled (`DATABASE_URL_UNPOOLED` if that is what Neon created)
3. Also set `AWARD_AVAILABILITY_API_KEY`, `NEXT_PUBLIC_APP_URL` if needed
4. Deploy — build runs `scripts/db-setup.mjs` (`prisma db push` + seed)

Force re-seed once: set `FORCE_SEED=1`, redeploy, remove it.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Local server |
| `npm run build` | DB setup + production build |
| `npm run db:push` | Sync Prisma schema to Neon |
| `npm run db:seed` | Seed programs, offers, cash fares |
| `npm run db:setup` | generate + push + seed |

## Provider guide

See [GUIA-APIS.md](./GUIA-APIS.md) for the staged integration checklist.

## Session logs

- [17 Jul 2026 — full build diary](./docs/DIARIO-2026-07-17.md) (Seats.aero, Points Now UI, Neon, daily award cache)
