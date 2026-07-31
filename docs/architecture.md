# Architecture - SIMANTIK

## Overview

SIMANTIK adalah Software Testing Management System dengan Automation Testing Platform terintegrasi.

Produk ini merupakan refactor V2 yang berfokus pada alur kerja **test case -> script -> execution -> report** dalam satu platform. Fitur RBAC (roles/permissions), team/project membership, test runs, dan bug reports **dihapus** untuk menjaga fokus dan kesederhanaan.

## Arsitektur Aplikasi

Dua proses independen yang berjalan dalam satu pnpm monorepo:

```
simantik/
    apps/
        web/          # Next.js (App Router) + Express 5 backend
    docs/             # Dokumentasi
```

`pnpm dev` menjalankan keduanya sekaligus:
- `next dev` di port 3000 (web app)
- `tsx watch src/server/index.ts` di port 3001 (Express API)

Automation engine (Playwright) dieksekusi **lokal** melalui `child_process.spawn` dari Express server. Tidak ada aplikasi automation terpisah.

## Backend (Express 5)

Berada di `apps/web/src/server` dengan arsitektur layered:

```
src/server/
    config/         # Env config
    lib/            # prisma, logger, errors
    middlewares/    # auth (JWT), validate (Zod), error-handler, security
    modules/        # Feature modules
    routes/         # Route registration
    validators/     # Shared Zod schemas
    index.ts        # Express bootstrap
```

Setiap feature module mengikuti pola `routes -> controllers -> services -> repositories`:

```
modules/
    auth/
    project/
    test-case/
    automation/
    execution/
    report/
    setting/
```

API responses konsisten: `{ success, message, data, errors?, timestamp }`. Pagination: `{ data, pagination: { page, limit, total, totalPages } }`.

## Frontend (Next.js App Router)

```
src/
    app/            # Halaman (route)
    components/     # ui/, common/, layout/
    features/       # Feature-based modules
    hooks/
    lib/
    providers/
    server/         # Express backend (lihat di atas)
    services/       # API client (axios)
    stores/         # Zustand (auth, theme, UI state)
    types/
    utils/
```

`app/` hanya berisi routing; business logic berada di `features/` dan `services/`. Server data memakai TanStack Query, bukan Zustand.

### Feature Modules (Frontend)

| Feature     | Isi                                                                 |
| ----------- | ------------------------------------------------------------------- |
| projects    | CRUD project, daftar project, detail + tab test cases               |
| test-cases  | CRUD test case, visual step builder (add/edit step), global list    |
| test-steps  | Types + modal add/edit step                                         |
| automation  | AutomationConfigForm, TestCaseAutomationPanel (generate + run)      |
| executions  | List executions, detail (logs, screenshot artifact, generated script) |
| reports     | ExecutionStatusSummary, overview page                               |
| settings    | Key/value settings manager                                          |

## Pola Otomatisasi

### Test Steps

Single source of truth: `src/constants/test-step-actions.ts`

- **31 action types** (`OPEN_BROWSER`, `NAVIGATE`, `CLICK`, `FILL`, `VERIFY_TEXT`, ...)
- **9 locator strategies** (`CSS`, `XPATH`, `TEXT`, `ROLE`, `PLACEHOLDER`, `LABEL`, `TEST_ID`, `ALT_TEXT`, `TITLE`)
- `TEST_STEP_ACTION_LABELS`, `ACTION_OPTIONS`, `LOCATOR_OPTIONS` untuk UI

Step server fields: `action, description, locatorStrategy, locatorValue, inputValue, expectedResult, stepNumber`.

### Generator

`src/server/modules/automation/services/playwright-script.service.ts` menerjemahkan test steps ke script Playwright dengan:
- `__log` / `__step` / `__locator` helpers
- Screenshot on pass & fail
- Browser console & pageerror capture
- Protocol stdout: `LOG:<level>:<message>` dan `RESULT:{"status","durationMs","error"}`

### Execution

- Eksekusi per test case (`POST /test-cases/:testCaseId/run`)
- Script ditulis ke `.artifacts/executions/<id>/script.cjs` lalu di-spawn
- Output protocol di-parse ke execution logs (stored di DB)
- Screenshot disimpan ke `.artifacts/executions/<id>/screenshot.png`
- Artifact disajikan via `GET /executions/:id/artifact/:name` (path-traversal guarded, `dotfiles: allow`)

### Automation Config

Field: `framework, browser, baseUrl, headless, viewportWidth, viewportHeight, timeout, retry, parallel, slowMotion`. Disimpan per project.

## Database

Prisma + MySQL (`simantik_database`). Model inti:

- `User`
- `Project`
- `TestCase` (status: `DRAFT`/`READY`/`ARCHIVED`, tags)
- `TestStep`
- `AutomationConfig`
- `Execution` (status, durationMs, errorMessage, consoleLog, screenshot/video/trace path)
- `ExecutionLog`
- `Setting`

Prisma commands dijalankan dari root repo: `pnpm exec prisma migrate dev --schema prisma/schema.prisma`.

## Keputusan Produk (Phase A-D)

1. **Fokus automation testing platform**: hapus RBAC, team/membership, test-run, bug report.
2. **Test step builder visual** sebagai input utama, bukan menulis kode.
3. **Script generation** 31 actions + 9 locator strategies.
4. **Eksekusi lokal** via spawn, bukan cloud/remote (roadmap).
5. **Per-module UI**: Projects, Test Cases, Automation, Executions, Reports, Settings, Profile, Dashboard.
6. **Tanpa RBAC** berarti semua pengguna memiliki akses setara ke semua resource.

## Roadmap (belum diimplementasikan)

Agent, remote/distributed execution, parallel runner, CI/CD integration, browser farm, scheduler.
