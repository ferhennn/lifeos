# LifeOS

Plan. Execute. Grow.

A personal operating system that turns long-term goals into daily execution:
**Goals → Strategies → Projects → Epics → Tasks → Daily Dashboard.** Every task
is traceable to the strategy and goal it exists for — no isolated todos.

## Phase 1 scope

This build covers **Authentication, Goals, Strategies, Projects (+ inline Epics),
Tasks, and the Daily Dashboard.** The sidebar shows the rest of the product
(LinkedIn, Jewellery, Agency, Portfolio, Learning Hub, Freelance CRM, Website
Audits, AI Assistant, Reviews, full Analytics/Calendar/Notifications, Habits) as
disabled "Soon" entries — no tables or pages for them exist yet.

Also deferred: task comments/attachments (needs a Supabase Storage bucket),
background/cron job infra (recurring task generation is on-demand — triggered on
strategy save, or via the "Sync upcoming tasks" action), PWA/offline, time
tracking, voice notes, import/export, templates.

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS · shadcn/ui (Base UI
primitives) · Supabase Auth (`@supabase/ssr`) · Drizzle ORM + Supabase Postgres ·
React Hook Form + Zod · Framer Motion · Recharts · Zustand · TanStack Query ·
dnd-kit · cmdk · next-themes

## Getting started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create a Supabase project

Create a project at [supabase.com](https://supabase.com), then in **Authentication
→ Providers** enable **Email** and **Google** sign-in (Google needs a Client
ID/Secret from the Google Cloud Console — set the redirect URI to
`https://<your-project>.supabase.co/auth/v1/callback`).

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in from your Supabase project settings:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — **Settings → API**
- `SUPABASE_SERVICE_ROLE_KEY` — **Settings → API** (kept server-only; not yet used
  in Phase 1 but reserved for future storage/admin operations)
- `DATABASE_URL` — **Settings → Database → Connection string**, "Transaction"
  pooler, port 6543
- `NEXT_PUBLIC_SITE_URL` — `http://localhost:3000` for local dev

### 4. Push the schema and wire up Auth

```bash
pnpm db:push
```

Then open the Supabase SQL editor and run `src/db/sql/001_profiles_trigger.sql`.
Drizzle manages the `public` schema; this one-time script (run by hand, not by
Drizzle) creates the trigger that mirrors new `auth.users` rows into
`public.profiles`, and turns on Row Level Security so every table is scoped to
its owning user.

### 5. Run it

```bash
pnpm dev
```

Sign up at `/signup` — a profile row is created automatically. Optionally seed
realistic sample data (5 goals, 5 strategies, a project with epics, and a mix of
tasks) for the account you just created:

```bash
pnpm db:seed
```

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build + typecheck |
| `pnpm db:generate` | Generate a SQL migration from the Drizzle schema |
| `pnpm db:push` | Push the schema straight to your Supabase Postgres instance |
| `pnpm db:studio` | Open Drizzle Studio against your database |
| `pnpm db:seed` | Seed demo data for the first signed-up user |

## Architecture

Feature-based under `src/features/*` (`auth`, `goals`, `strategies`, `projects`,
`tasks`, `dashboard`) — each with its own `schema/` (Zod), `actions/` (Next.js
Server Actions, the only data-access layer), and `components/`. Shared,
domain-agnostic UI lives in `src/components/shared`; shadcn primitives in
`src/components/ui`. Database schema is in `src/db/schema/*`, one file per
table plus a central `relations.ts` to avoid circular imports between tables
that reference each other in both directions (e.g. tasks ↔ everything).

Tasks carry denormalized `goalId` / `strategyId` / `projectId` / `epicId`
columns — deliberate, so the Daily Dashboard and any "why does this task exist"
view are single-table queries instead of multi-way joins.

Recurring task generation (`src/features/strategies/lib/recurrence.ts`) computes
occurrences for a rolling 14-day window from a strategy's cadence and
materializes them as real `tasks` rows on strategy save; there's no scheduler,
so a stale window is caught up next time the strategy is opened.
