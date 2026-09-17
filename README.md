# Nagoya 2026 Observation Platform

A two-part tool for the Doha 2030 Asian Games Organizing Committee's observation
mission at the Nagoya 2026 Asian Games:

1. **Finding submission** (`/new`) — a mobile-first form for field observers to
   log a finding: photo (camera or gallery), date/time, venue, functional area,
   description, and relevance to 2030 planning (High/Medium/Low). Each finding
   gets a unique reference number (`NGY26-00001`, `NGY26-00002`, …).
2. **Reporting dashboard** (`/dashboard`) — a Google Maps view with one pin per
   venue (colored by the venue's highest-relevance finding, sized by finding
   count), summary charts by venue / functional area / relevance, a
   click-through from map pin → findings list → finding detail, and Excel/PDF
   export of the raw data.

The whole site sits behind a single shared passcode (`SITE_PASSCODE`) — there
are no individual user accounts, which keeps friction low for a short-lived
field observation mission.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres for the `findings` table, Storage for photos)
- Google Maps JavaScript API (`@react-google-maps/api`) for the dashboard map
- Recharts for charts, ExcelJS for `.xlsx` export, jsPDF for `.pdf` export

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | From the Supabase project settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public anon key — RLS policies restrict it to insert/select on `findings` and the `finding-photos` bucket |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | For the map | Billing-enabled Google Cloud project with the Maps JavaScript API enabled. Without it, the dashboard shows a placeholder in place of the map; everything else still works |
| `SITE_PASSCODE` | Recommended | Shared passcode for the whole site. Leave blank (with `SESSION_SECRET`) to disable the gate entirely |
| `SESSION_SECRET` | Recommended | Random string used to sign the session cookie (e.g. `openssl rand -hex 32`) |

## Development

```bash
npm install
npm run dev
```

## Venue coordinates

`src/lib/venues.ts` holds a best-effort city/site-level coordinate for each of
the official venue list's ~72 entries, used to place map pins. These are not
surveyed venue entrances — update the `lat`/`lng` values there as exact venue
GPS coordinates become available from the OCOG venue team.

## Database schema

Applied via Supabase migration (see project `aichi-nagoya26-observations`):

- `findings` table: one row per logged finding, with a trigger that assigns
  `finding_number` (`NGY26-00001`, …) on insert.
- `finding-photos` storage bucket: public-read, used for observer photo uploads.
- RLS policies allow the anon key to `insert` and `select` on both — access
  control for the app itself is the shared passcode gate, not per-row auth.
