# FareAtlas

MVP for Australians deciding whether to travel with points or pay cash.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Mock data now, API adapters isolated in `src/lib/api.ts`

## Integrations

| Stage | Provider | Status |
| --- | --- | --- |
| 1 Award availability | Seats.aero Partner API | Wired (`AWARD_AVAILABILITY_API_KEY`) |
| 2 Cash fares | Amadeus (planned) | Mock |
| 3 Loyalty offers | Editorial / admin | Mock |
| 4 Notifications | Resend / Twilio | Not started |
| 5 Database | Neon Postgres | Not started |

### Seats.aero (local)

```bash
cp .env.example .env.local
# paste AWARD_AVAILABILITY_API_KEY=
npm run dev
```

Endpoints:

- `GET /api/awards/search?origin=SYD&destination=HND`
- `GET /api/awards/{availabilityId}/trips`

See `GUIA-APIS.md` for the full provider checklist.

## Local dev

```bash
npm run dev
```

## Deploy recommendation

Use Vercel now and Neon for Postgres. This is the fastest path for the current Next.js build, scheduled jobs can be added through Vercel Cron, and the database can later move or stay external when migrating the app/API to a VPS.

When moving to a VPS, keep Neon as the managed database unless cost or data residency requires self-hosted Postgres. Move only the app/API first.
