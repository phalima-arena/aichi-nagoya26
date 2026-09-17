# Nagoya 2026 Observation Platform

A two-part tool for the Doha 2030 Asian Games Organizing Committee's observation
mission at the Nagoya 2026 Asian Games:

1. **Finding submission** (`/new`) — a mobile-first form for field observers to
   log a finding: photo (camera or gallery), date/time, venue, functional area,
   description, and relevance to 2030 planning (High/Medium/Low). Each finding
   gets a unique reference number (`NGY26-00001`, `NGY26-00002`, …).
2. **Reporting dashboard** (`/dashboard`) — KPI tiles, a venue filter over a
   findings list (click any row to see the full detail, including the photo),
   summary charts by venue / functional area / relevance, and Excel/PDF
   export of the raw data.

The whole site sits behind a single shared passcode (`SITE_PASSCODE`) — there
are no individual user accounts, which keeps friction low for a short-lived
field observation mission.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres for the `findings` table, Storage for photos)
- Recharts for charts, ExcelJS for `.xlsx` export, jsPDF for `.pdf` export

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | From the Supabase project settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public anon key — RLS policies restrict it to insert/select on `findings` and the `finding-photos` bucket |
| `SITE_PASSCODE` | Recommended | Shared passcode for the whole site. Leave blank (with `SESSION_SECRET`) to disable the gate entirely |
| `SESSION_SECRET` | Recommended | Random string used to sign the session cookie (e.g. `openssl rand -hex 32`) |

## Development

```bash
npm install
npm run dev
```

## Venue list

`src/lib/venues.ts` holds the official ~72-venue list (alphabetized) used by
the submission form's venue dropdown. It also carries a best-effort city/site
`lat`/`lng` per venue, stored on each finding but not currently rendered
anywhere in the UI (the dashboard's map view was dropped in favor of a
filterable findings list). Those coordinates are kept in the schema in case a
map view is reintroduced later.

## Database schema

Applied via Supabase migration (see project `aichi-nagoya26-observations`):

- `findings` table: one row per logged finding, with a trigger that assigns
  `finding_number` (`NGY26-00001`, …) on insert.
- `finding-photos` storage bucket: public-read, used for observer photo uploads.
- RLS policies allow the anon key to `insert` and `select` on both — access
  control for the app itself is the shared passcode gate, not per-row auth.
