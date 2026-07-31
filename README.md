# SIMANTIK

Software Testing Management System dengan visual test step builder dan Automation Testing Platform terintegrasi.

## Fitur

- Manajemen Project dan Test Case dengan visual step builder
- Generasi script Playwright otomatis dari test steps
- Eksekusi test lokal (headless/headed) via Playwright
- Pelacakan Executions dengan logs, screenshot, dan error detail
- Dashboard dan Reports (status summary, recent executions)
- Konfigurasi Automation per project
- Pengaturan global dan manajemen profile user

## Tech Stack

- Next.js 15+ (App Router)
- React 19
- TypeScript
- Express 5 (embedded server di `apps/web/src/server`)
- Prisma 6 + MySQL
- Playwright
- Mantine UI
- TanStack Query
- Zustand
- pnpm Workspace

## Struktur

```
apps/
    web/          # Next.js + Express backend

docs/             # Dokumentasi arsitektur dan domain
```

## Setup

1. Salin `.env.example` menjadi `.env.local` dan isi `DATABASE_URL`.
2. Install dependencies: `pnpm install`
3. Jalankan migration dan seed:
   ```
   pnpm db:migrate
   pnpm db:seed
   ```
4. Jalankan development server (Next.js + Express sekaligus):
   ```
   pnpm dev
   ```
   - Web: http://localhost:3000
   - API: http://localhost:3001

## Akun Default (Seed)

- Email: `tester@simantik.local`
- Password: `Password123!`

## Script

| Perintah            | Deskripsi                          |
| ------------------- | ---------------------------------- |
| `pnpm dev`          | Jalankan web + API (dev)           |
| `pnpm build`        | Build production (web)             |
| `pnpm typecheck`    | Type-check seluruh workspace       |
| `pnpm lint`         | ESLint                             |
| `pnpm db:migrate`   | Jalankan Prisma migrate            |
| `pnpm db:seed`      | Seed database                      |
