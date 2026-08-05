# SIMANTIK — Software Testing Management System

A modern Software Testing Management System inspired by TestRail. SIMANTIK lets you manage
projects, test cases, test steps and automated executions through a clean web UI, and runs
the automation tests against its own real interface using Playwright.

## Architecture Overview

SIMANTIK is a single repository containing two cooperating applications:

```
simantik/
├── src/                    # Web application (Next.js, App Router)
│   ├── app/                # Route segments (pages, layouts)
│   ├── components/         # Reusable UI / common / layout components
│   ├── features/           # Feature modules (auth, projects, test-cases, automation, …)
│   ├── hooks/              # Shared React hooks
│   ├── lib/                # Shared client utilities
│   ├── providers/          # React providers (query, mantine, auth, …)
│   ├── server/             # API server (Express + Prisma)
│   ├── services/           # HTTP client / API services
│   ├── store/              # Zustand stores (auth, theme, session, UI)
│   ├── types/              # Shared TypeScript types
│   └── utils/              # Utility functions
├── prisma/                 # Database schema, migrations, seed scripts
├── storage/                # Runtime artifacts (executions, screenshots, traces)
└── package.json
```

- **Web application** — Next.js + React + Mantine. Renders the UI the automation suite drives.
- **API server** — Express + Prisma. Serves `localhost:3001/api`. Business logic lives in
  `src/server/modules/*` following a controller → service → repository layered architecture.
- **Automation engine** — Lives inside the API server (`src/server/modules/automation`).
  Executes test cases through the real browser (Playwright), captures screenshots/videos/traces,
  and writes execution results back to the database. It never touches the database directly
  except through the same business services.

### Runtime Topology

| Component | URL | Tech |
|---|---|---|
| Web app | `http://localhost:3000` | Next.js 16 (App Router) |
| API server | `http://localhost:3001` | Express 5 + Prisma 6 |
| Database | MySQL (local) | Prisma ORM |

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript (strict), Mantine 9, Tailwind CSS
- **State & data**: TanStack Query (server state), Zustand (auth/theme/session/UI)
- **Forms**: React Hook Form + Zod
- **Backend**: Express 5, Prisma, MySQL, JWT auth, Zod validation, Pino logging
- **Automation**: Playwright (headless Chromium), Page Object Model
- **Tooling**: pnpm, concurrently, tsx

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- MySQL running with a database (see `DATABASE_URL`)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in the values (database URL, JWT secret, etc.):

```bash
cp .env.example .env
```

Key variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | MySQL connection string |
| `PORT` | API server port (default `3001`) |
| `JWT_SECRET` | Secret used to sign JWTs |
| `CORS_ORIGIN` | Allowed web origin (default `http://localhost:3000`) |
| `ENCRYPTION_KEY` | 64 hex chars (32 bytes) for AES-256-GCM encryption of project credentials |
| `NEXT_PUBLIC_API_URL` | API base URL used by the web client |

### 3. Prepare the database

```bash
pnpm db:generate   # Generate Prisma client
pnpm db:migrate    # Apply migrations
pnpm db:seed       # Seed base data
```

Additional seed variants:

- `npx tsx --env-file=.env prisma/seed-professional.ts` — full professional dataset
- `npx tsx --env-file=.env prisma/seed-qa-automation.ts` — QA/automation dataset
- `npx tsx --env-file=.env prisma/update-qa-automation-steps.ts` — resets the 18 automation
  test cases to their source-of-truth step definitions (re-run before a fresh suite run)

### 4. Run in development

```bash
pnpm dev
```

This runs both applications concurrently:

- **Next.js** web app on `http://localhost:3000`
- **Express** API server on `http://localhost:3001`

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Run web + API concurrently with hot reload |
| `pnpm dev:web` | Run only the Next.js web app |
| `pnpm dev:server` | Run only the Express API server (`tsx watch`) |
| `pnpm build` | Build the Next.js web app |
| `pnpm start` | Start the built Next.js app |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm db:generate` | Generate the Prisma client |
| `pnpm db:migrate` | Apply Prisma migrations |
| `pnpm db:seed` | Run the base seed script |

## Authentication

The API uses JWT (short-lived access token + refresh token). The client intercepts `401`
responses and transparently refreshes the token; failed logins surface inline form errors.

Seed data provides a QA account used by the automation suite:

- **Email**: `tester@simantik.local`
- **Password**: `Password123!`

## Automation Engine

### How it works

1. Each automated test case has a list of **steps** (`action`, `locatorStrategy`,
   `locatorValue`, `inputValue`, `expectedResult`).
2. Triggering a run — `POST /api/test-cases/:id/run` — resolves/regenerates a Playwright
   script and launches a browser session.
3. Steps are executed against the live UI using a multi-strategy locator resolver
   (TEXT, ROLE, LABEL, ARIA_LABEL, CSS, ID, NAME, PLACEHOLDER, etc.) with cascade fallback,
   exact-name disambiguation and self-healing.
4. Results (status, logs, screenshots, videos, traces, error data) are stored and exposed
   through the execution API and the web UI.

### QA suite

SIMANTIK includes **18 automation test cases** (`TC-SIMANTIK-001` … `TC-SIMANTIK-018`)
covering authentication, dashboard, project management, test-case management, test-step
management, automation, execution, reporting, profile and logout.

Source of truth for their steps: `prisma/update-qa-automation-steps.ts`.

Re-run the whole suite with the local harness:

```bash
node .run-all.tmp.mjs
```

The harness logs in, triggers each test case run through the API, polls the execution until
it finishes, and prints a per-test-case summary and pass rate. HTML snapshots of failures are
written to `storage/executions/EX-*.html`.

## Architecture Conventions

- **Feature-based architecture** — every feature owns its code under `src/features/<feature>/`
  (`components/`, `hooks/`, `services/`, `schemas/`, `types/`, `constants/`).
- **Layered API** — controllers stay thin, business logic lives in services, data access in
  repositories (see `src/server/README.md`).
- **Relative imports** — no import aliases (`@/`); strict TypeScript, no `any`.
- **Server state** — TanStack Query only; server data is never stored in Zustand.
- **Forms** — React Hook Form + Zod; never manual validation.
- **Validation** — request bodies, query params and forms are always validated with Zod.

## Environment / Security

- Never commit `.env`; only `.env.example` is committed.
- Secrets are never hardcoded; project credentials are encrypted at rest.
- Runtime logs (`server.log`, `*.log`) and backup folders (`.backup/`) are git-ignored.

## Deploying

```bash
pnpm build
pnpm start
```

The API server runs from `src/server/index.ts` (e.g. `tsx src/server/index.ts` in production
or after compiling to `dist/`). See `src/server/README.md` for backend architecture details.
