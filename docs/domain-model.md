# Domain Model - SIMANTIK

## Overview

SIMANTIK adalah Software Testing Management System dengan Automation Testing Platform terintegrasi. Pengguna menyusun test case secara visual (step builder), sistem meng-generate script Playwright, mengeksekusi secara lokal, dan melacak hasilnya dalam executions serta reports.

Platform berfokus pada alur kerja test case -> script -> execution -> report. Tidak ada konsep role/RBAC, team membership, test run, atau bug report.

## Entitas

### User

Pengguna platform. Setiap user memiliki akses setara ke seluruh resource (tanpa RBAC).

### Project

Container logis yang mengelompokkan aktivitas pengujian terkait.

- Memiliki kode (mis. `PROJ-0001`) dan slug unik
- Berisi Test Case
- Memiliki satu AutomationConfig

### TestCase

Unit pengujian yang bisa dieksekusi.

- Kode unik per project (mis. `TC-0001`)
- Status: `DRAFT`, `READY`, `ARCHIVED`
- Memiliki sejumlah TestStep
- Memiliki banyak Execution

### TestStep

Langkah individual dalam test case, disusun secara visual.

- `action`: 31 action types
- `locatorStrategy` + `locatorValue`: 9 locator strategies
- `inputValue`, `expectedResult`, `description`, `stepNumber`

### AutomationConfig

Konfigurasi eksekusi otomatisasi per project.

- `framework`, `browser`, `baseUrl`, `headless`, `viewportWidth`, `viewportHeight`
- `timeout`, `retry`, `parallel`, `slowMotion`

### Execution

Hasil eksekusi test case oleh Playwright.

- Status: `RUNNING`, `PASSED`, `FAILED`, `ERROR`, `SKIPPED`
- `durationMs`, `errorMessage`, `consoleLog`
- Path artifact: `screenshotPath`, `videoPath`, `tracePath`
- `generatedScript`: script yang dieksekusi

### ExecutionLog

Log baris-per-baris dari output eksekusi (LEVEL `INFO`/`STEP`/`ERROR`).

### Setting

Pasangan key/value untuk pengaturan global platform.

## Alur Kerja

1. Pengguna membuat **Project**
2. Pengguna membuat **TestCase** dan menyusun **TestSteps** secara visual
3. Sistem **meng-generate script Playwright** dari steps
4. Sistem **mengeksekusi** test case (headless/headed) via Playwright
5. Hasil disimpan sebagai **Execution** beserta logs dan screenshot
6. Pengguna melihat hasilnya di **Executions** dan **Reports**

## Hierarki Entitas

```
User
│
└── Project
        ├── TestCase
        │       ├── TestStep
        │       └── Execution
        │               └── ExecutionLog
        └── AutomationConfig

Setting (global, standalone)
```

## Ringkasan

- Tanpa RBAC: semua user memiliki akses setara
- **Project** adalah container utama
- **TestCase** + **TestStep** adalah inti manajemen pengujian
- **AutomationConfig** mengatur eksekusi
- **Execution** + **ExecutionLog** melacak hasil eksekusi
- **Setting** menyimpan konfigurasi global
