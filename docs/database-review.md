# Database Design Review - SIMANTIK

## Ringkasan Eksekutif

Review ini mengevaluasi desain database SIMANTIK berdasarkan domain model dan ERD yang sudah didefinisikan. Desain secara keseluruhan solid dengan arsitektur yang jelas (Global Role → Project → Test Case → Execution), namun terdapat beberapa area yang perlu diperbaiki sebelum implementasi Prisma.

---

## 1. Kekuatan (Strengths)

| Area | Deskripsi |
|------|-----------|
| **Hierarki Entitas Jelas** | Struktur 4-level (Role → User → Project → Test Case → Execution) dengan ownership yang terdefinisi baik |
| **Global Role Sederhana** | Role global (Manager, Tester, Developer) terpisah dari membership, mendukung RBAC yang sederhana |
| **Junction Table Explisit** | ProjectMember menghubungkan User dan Project dengan clean |
| **Audit Trail Fundamental** | Semua entitas utama memiliki `createdAt`, `updatedAt` |
| **Soft Delete Ready** | Project memiliki `deletedAt`, siap untuk soft delete |
| **Flexible Bug Reporting** | Bug Report bisa terhubung ke Execution DAN/ATAU Test Case (opsional), mendukung bug manual & dari eksekusi |
| **Execution Result Granular** | Pelacakan hasil per test step memungkinkan analisis mendalam |

---

## 2. Kelemahan (Weaknesses)

### 2.1 Missing Soft Delete Fields
| Entitas | Field Hilang |
|---------|--------------|
| Role | `deletedAt` |
| User | `deletedAt` |
| Project | `deletedAt` (hanya status) |
| TestCase | `deletedAt` (hanya status) |
| TestStep | `deletedAt` |
| TestRun | `deletedAt` |
| Execution | `deletedAt` |
| ExecutionResult | `deletedAt` |
| BugReport | `deletedAt` |

**Dampak**: Tidak bisa melakukan soft delete konsisten, query perlu filter manual `status != 'archived'` di mana-mana.

### 2.2 Missing Unique Constraints
| Entitas | Constraint Hilang | Risiko |
|---------|-------------------|--------|
| User | `email` unique | Duplicate account |
| Project | `slug` unique | Duplicate project slug |
| ProjectMember | `user_id` + `project_id` unique | User join project 2x |
| TestCase | `project_id` + `title` unique (optional) | Duplicate test case title |
| TestStep | `test_case_id` + `step_number` unique | Duplicate step number |
| TestRun | `project_id` + `name` unique | Duplicate test run name |
| BugReport | - | Tidak ada dedup natural key |

### 2.3 Missing Indexes untuk Query Performance
| Query Pattern | Index Diperlukan |
|---------------|------------------|
| User login | `User.email` (unique) |
| Project members | `ProjectMember.project_id`, `ProjectMember.user_id` |
| Project by creator | `Project.created_by_id` |
| TestCase by project | `TestCase.project_id` |
| TestCase by creator | `TestCase.created_by_id` |
| TestRun by project | `TestRun.project_id` |
| TestRun by assignee | `TestRun.assigned_to_id` |
| Execution by testRun | `Execution.test_run_id` |
| Execution by testCase | `Execution.test_case_id` |
| Execution by executor | `Execution.executed_by_id` |
| ExecutionResult by execution | `ExecutionResult.execution_id` |
| ExecutionResult by testStep | `ExecutionResult.test_step_id` |
| BugReport by project | `BugReport.project_id` |
| BugReport by assignee | `BugReport.assigned_to_id` |
| BugReport by reporter | `BugReport.reported_by_id` |
| BugReport by execution | `BugReport.execution_id` |

### 2.4 Naming Convention Inconsistency
| Issue | Contoh | Rekomendasi |
|-------|--------|-------------|
| Mixed casing FK | `created_by`, `assigned_to`, `owner_id`, `executed_by` | Standar: `createdById`, `assignedToId`, `ownerId`, `executedById` (camelCase) |
| Boolean vs Enum | `User.isActive` (boolean) vs `Project.status` (enum) | Gunakan enum `status` untuk semua |
| Table naming | `test_run_test_cases` (snake_case) | Prisma default snake_case, OK |
| Column naming | `step_number` vs urutan di junction | Konsisten: `stepNumber`, `sortOrder` |

### 2.5 ProjectMember Missing Fields
- `invitedBy` (FK ke User) - siapa yang mengundang
- `invitedAt` - kapan diundang
- `acceptedAt` - kapan accept invitation
- Status invitation: `pending` | `active` | `revoked`

### 2.6 TestRun Missing Fields
- `testRunNumber` / `code` - identifier human-readable (seperti TR-001)
- `environment` - sudah ada tapi tipe tidak jelas (enum?)
- `totalTestCases`, `passedCount`, `failedCount`, `blockedCount`, `skippedCount` - denormalized counters untuk dashboard

### 2.7 Execution Missing Fields
- `startedAt`, `completedAt` - selain `executedAt` untuk durasi akurat
- `environment` - snapshot environment saat eksekusi
- `buildVersion` - snapshot build saat eksekusi

---

## 3. Risiko (Risks)

| Risiko | Probabilitas | Dampak | Mitigasi |
|--------|--------------|--------|----------|
| **No soft delete** | Tinggi | Data loss risk, compliance issue | Tambah `deletedAt` di semua entitas |
| **Missing unique email** | Tinggi | Duplicate accounts, login broken | Unique constraint `User.email` |
| **No composite unique ProjectMember** | Tinggi | User join 2x project | Unique `[userId, projectId]` |
| **Missing indexes** | Tinggi | Slow query di production >10k rows | Tambah index sebelum launch |
| **Cascade delete ambiguity** | Sedang | Orphan records / accidental deletion | Definisikan `onDelete` eksplisit per relasi |
| **No audit log table** | Sedang | Tidak bisa track perubahan kritis | Buat tabel `ActivityLog` terpisah |
| **BugReport optional FKs** | Sedang | Data integrity (bug tanpa konteks) | Validasi application-level wajib salah satu |
| **TestRun-TestCase junction tanpa sortOrder** | Rendah | Urutan eksekusi tidak deterministic | Tambah `sortOrder` di junction |

---

## 4. Rekomendasi (Recommendations)

### 4.1 Critical (Implementasi Sebelum Prisma Generate)

#### Tambah Soft Delete Fields
```prisma
// Semua model utama
model User {
  // ...
  deletedAt DateTime?
  @@index([deletedAt])
}

model Project {
  // ...
  deletedAt DateTime?
  @@index([deletedAt])
}
// ... dst untuk semua model
```

#### Unique Constraints Wajib
```prisma
model User {
  // ...
  @@unique([email])
}

model ProjectMember {
  // ...
  @@unique([userId, projectId])
}

model TestStep {
  // ...
  @@unique([testCaseId, stepNumber])
}

model TestRun {
  // ...
  @@unique([projectId, name])
}
```

#### Index Strategy
```prisma
model ProjectMember {
  // ...
  @@index([projectId])
  @@index([userId])
}

model TestCase {
  // ...
  @@index([projectId])
  @@index([createdById])
  @@index([status])
}

model TestRun {
  // ...
  @@index([projectId])
  @@index([assignedToId])
  @@index([status])
  @@index([createdById])
}

model Execution {
  // ...
  @@index([testRunId])
  @@index([testCaseId])
  @@index([executedById])
  @@index([status])
}

model ExecutionResult {
  // ...
  @@index([executionId])
  @@index([testStepId])
}

model BugReport {
  // ...
  @@index([projectId])
  @@index([assignedToId])
  @@index([reportedById])
  @@index([executionId])
  @@index([testCaseId])
  @@index([status])
  @@index([severity])
}

model TestRunTestCase {
  // Junction table
  @@index([testRunId])
  @@index([testCaseId])
  @@unique([testRunId, testCaseId])
}
```

#### Cascade Delete Rules
```prisma
// Project -> TestCase: Cascade
// TestCase -> TestStep: Cascade
// TestRun -> Execution: Cascade
// Execution -> ExecutionResult: Cascade
// User -> ProjectMember: SetNull (retain history)
// Project -> ProjectMember: Cascade
// User -> BugReport (reporter): SetNull
// User -> BugReport (assignee): SetNull
```

### 4.2 High Priority (Sprint 1)

#### ProjectMember Enhancement
```prisma
model ProjectMember {
  id            String   @id @default(uuid()) @db.Char(36)
  projectId     String
  userId        String
  invitedById   String?  // FK ke User
  status        MemberStatus @default(PENDING) // PENDING | ACTIVE | REVOKED
  invitedAt     DateTime @default(now())
  acceptedAt    DateTime?
  joinedAt      DateTime @default(now())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime?

  project       Project  @relation(fields: [projectId], references: [id])
  user          User     @relation(fields: [userId], references: [id])
  invitedBy     User?    @relation("ProjectInvitations", fields: [invitedById], references: [id])

  @@unique([userId, projectId])
  @@index([projectId])
  @@index([userId])
  @@index([status])
}

enum MemberStatus {
  PENDING
  ACTIVE
  REVOKED
}
```

#### TestRun Enhancement
```prisma
model TestRun {
  id              String       @id @default(uuid()) @db.Char(36)
  projectId       String
  name            String
  description     String?
  code            String       // TR-001, human readable
  createdById     String
  assignedToId    String?
  startDate       DateTime?
  dueDate         DateTime?
  status          TestRunStatus @default(PLANNED)
  environment     Environment  @default(STAGING)
  buildVersion    String?
  totalTestCases  Int          @default(0)
  passedCount     Int          @default(0)
  failedCount     Int          @default(0)
  blockedCount    Int          @default(0)
  skippedCount    Int          @default(0)
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  deletedAt       DateTime?

  project         Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  createdBy       User         @relation("CreatedTestRuns", fields: [createdById], references: [id])
  assignedTo      User?        @relation("AssignedTestRuns", fields: [assignedToId], references: [id])
  testCases       TestRunTestCase[]
  executions      Execution[]

  @@unique([projectId, code])
  @@unique([projectId, name])
  @@index([projectId])
  @@index([assignedToId])
  @@index([status])
  @@index([createdById])
}

enum TestRunStatus {
  PLANNED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum Environment {
  DEVELOPMENT
  STAGING
  PRODUCTION
}
```

#### Execution Enhancement
```prisma
model Execution {
  id            String         @id @default(uuid()) @db.Char(36)
  testRunId     String
  testCaseId    String
  executedById  String
  startedAt     DateTime?
  completedAt   DateTime?
  status        ExecutionStatus @default(NOT_STARTED)
  actualResult  String?
  notes         String?
  duration      Int?           // dalam detik
  environment   String?        // snapshot
  buildVersion  String?        // snapshot
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  deletedAt     DateTime?

  testRun       TestRun        @relation(fields: [testRunId], references: [id], onDelete: Cascade)
  testCase      TestCase       @relation(fields: [testCaseId], references: [id])
  executedBy    User           @relation(fields: [executedById], references: [id])
  results       ExecutionResult[]
  bugReports    BugReport[]

  @@index([testRunId])
  @@index([testCaseId])
  @@index([executedById])
  @@index([status])
}

enum ExecutionStatus {
  NOT_STARTED
  IN_PROGRESS
  PASSED
  FAILED
  BLOCKED
  SKIPPED
}
```

### 4.3 Medium Priority (Future Scalability)

#### Activity Log Table (Audit Trail)
```prisma
model ActivityLog {
  id           String        @id @default(uuid()) @db.Char(36)
  projectId    String?
  userId       String
  entityType   String        // "TestCase", "TestRun", "BugReport", etc.
  entityId     String
  action       ActivityAction // CREATE, UPDATE, DELETE, EXECUTE, ASSIGN, etc.
  oldData      Json?         // snapshot sebelum
  newData      Json?         // snapshot sesudah
  metadata     Json?         // info tambahan (IP, userAgent, dll)
  createdAt    DateTime      @default(now())

  project      Project?      @relation(fields: [projectId], references: [id])
  user         User          @relation(fields: [userId], references: [id])

  @@index([projectId, createdAt])
  @@index([entityType, entityId])
  @@index([userId, createdAt])
}

enum ActivityAction {
  CREATE
  UPDATE
  DELETE
  EXECUTE
  ASSIGN
  STATUS_CHANGE
  COMMENT
  ATTACHMENT_UPLOAD
}
```

#### Attachment Table (Polymorphic)
```prisma
model Attachment {
  id            String         @id @default(uuid()) @db.Char(36)
  projectId     String?
  entityType    String         // "TestCase", "Execution", "BugReport", "TestStep"
  entityId      String
  fileName      String
  filePath      String         // path di storage (S3, local, dll)
  mimeType      String
  fileSize      Int            // bytes
  uploadedById  String
  description   String?
  createdAt     DateTime       @default(now())
  deletedAt     DateTime?

  project       Project?       @relation(fields: [projectId], references: [id])
  uploadedBy    User           @relation(fields: [uploadedById], references: [id])

  @@index([projectId])
  @@index([entityType, entityId])
  @@index([uploadedById])
}
```

#### Comment Table (Polymorphic + Threaded)
```prisma
model Comment {
  id            String      @id @default(uuid()) @db.Char(36)
  projectId     String?
  entityType    String      // "TestCase", "Execution", "BugReport"
  entityId      String
  userId        String
  parentId      String?     // untuk thread/reply
  content       String
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  deletedAt     DateTime?

  project       Project?    @relation(fields: [projectId], references: [id])
  user          User        @relation(fields: [userId], references: [id])
  parent        Comment?    @relation("CommentReplies", fields: [parentId], references: [id])
  replies       Comment[]   @relation("CommentReplies")

  @@index([projectId])
  @@index([entityType, entityId])
  @@index([userId])
  @@index([parentId])
}
```

#### Notification Table
```prisma
model Notification {
  id            String              @id @default(uuid()) @db.Char(36)
  projectId     String
  userId        String              // penerima
  type          NotificationType
  title         String
  message       String
  entityType    String?             // "TestRun", "BugReport", "TestCase"
  entityId      String?
  actionUrl     String?             // deep link ke entity
  isRead        Boolean             @default(false)
  readAt        DateTime?
  createdAt     DateTime            @default(now())

  project       Project             @relation(fields: [projectId], references: [id])
  user          User                @relation(fields: [userId], references: [id])

  @@index([projectId, userId, isRead])
  @@index([userId, isRead, createdAt])
  @@index([entityType, entityId])
}

enum NotificationType {
  TEST_RUN_ASSIGNED
  TEST_RUN_STATUS_CHANGED
  BUG_ASSIGNED
  BUG_STATUS_CHANGED
  BUG_COMMENTED
  PROJECT_INVITATION
  TEST_CASE_ASSIGNED
  EXECUTION_COMPLETED
  MENTION
}
```

#### Automation Entities
```prisma
model TestScript {
  id            String         @id @default(uuid()) @db.Char(36)
  projectId     String?
  name          String
  description   String?
  repositoryUrl String
  branch        String         @default("main")
  filePath      String         // path ke file test di repo
  framework     TestFramework  @default(PLAYWRIGHT)
  language      String         @default("typescript")
  status        ScriptStatus   @default(ACTIVE)
  createdById   String
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  deletedAt     DateTime?

  project       Project?       @relation(fields: [projectId], references: [id])
  createdBy     User           @relation(fields: [createdById], references: [id])
  testCases     TestCaseScript[]
  runs          AutomationRun[]

  @@index([projectId])
  @@index([status])
}

model TestCaseScript {
  id            String      @id @default(uuid()) @db.Char(36)
  testCaseId    String
  testScriptId  String
  functionName  String      // nama fungsi test di script
  createdAt     DateTime    @default(now())

  testCase      TestCase    @relation(fields: [testCaseId], references: [id], onDelete: Cascade)
  testScript    TestScript  @relation(fields: [testScriptId], references: [id], onDelete: Cascade)

  @@unique([testCaseId, testScriptId])
  @@index([testScriptId])
}

model AutomationRun {
  id              String           @id @default(uuid()) @db.Char(36)
  testScriptId    String
  projectId       String?
  triggeredById   String
  triggerType     AutomationTrigger @default(MANUAL) // MANUAL, SCHEDULED, CI_CD, WEBHOOK
  status          AutomationRunStatus @default(PENDING)
  environment     String
  buildVersion    String?
  branch          String
  commitSha       String?
  startedAt       DateTime?
  completedAt     DateTime?
  totalTests      Int              @default(0)
  passedCount     Int              @default(0)
  failedCount     Int              @default(0)
  skippedCount    Int              @default(0)
  duration        Int?             // detik
  reportUrl       String?          // link ke HTML report
  errorMessage    String?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  testScript      TestScript       @relation(fields: [testScriptId], references: [id])
  project         Project?         @relation(fields: [projectId], references: [id])
  triggeredBy     User             @relation(fields: [triggeredById], references: [id])
  results         AutomationResult[]

  @@index([projectId])
  @@index([testScriptId])
  @@index([status])
  @@index([triggeredById])
}

model AutomationResult {
  id              String      @id @default(uuid()) @db.Char(36)
  automationRunId String
  testCaseId      String
  testScriptId    String
  status          ExecutionStatus // reuse enum
  duration        Int?        // ms
  errorMessage    String?
  stackTrace      String?
  screenshotUrl   String?
  videoUrl        String?
  traceUrl        String?
  startedAt       DateTime
  completedAt     DateTime
  createdAt       DateTime    @default(now())

  automationRun   AutomationRun @relation(fields: [automationRunId], references: [id], onDelete: Cascade)
  testCase        TestCase      @relation(fields: [testCaseId], references: [id])
  testScript      TestScript    @relation(fields: [testScriptId], references: [id])

  @@index([automationRunId])
  @@index([testCaseId])
  @@index([testScriptId])
  @@index([status])
}

enum TestFramework {
  PLAYWRIGHT
  CYPRESS
  SELENIUM
  PUPPETEER
  CUSTOM
}

enum ScriptStatus {
  ACTIVE
  DEPRECATED
  ARCHIVED
}

enum AutomationTrigger {
  MANUAL
  SCHEDULED
  CI_CD
  WEBHOOK
}

enum AutomationRunStatus {
  PENDING
  RUNNING
  PASSED
  FAILED
  CANCELLED
  TIMEOUT
}
```

### 4.4 Naming Convention Standards

| Element | Convention | Example |
|---------|------------|---------|
| Model | PascalCase singular | `TestCase`, `ProjectMember` |
| Field | camelCase | `createdAt`, `projectId`, `assignedToId` |
| Enum | PascalCase singular | `TestRunStatus`, `MemberStatus` |
| Enum value | UPPER_SNAKE_CASE | `IN_PROGRESS`, `PENDING` |
| Relation name | PascalCase descriptive | `createdBy`, `assignedTo`, `projectMembers` |
| Junction table | ModelAModelB | `TestRunTestCase` |
| Index name | implicit via `@@index` | - |
| Foreign key | `{relationName}Id` | `createdById`, `projectId` |

---

## 5. Kesimpulan Akhir (Final Conclusion)

### Status Kesiapan: **TIDAK SIAP** untuk Prisma Generate

### Blocker yang Harus Diselesaikan:
1. ✅ **Tambah `deletedAt` di SEMUA model** (12 model)
2. ✅ **Unique constraint `User.email`**
3. ✅ **Composite unique `ProjectMember[userId, projectId]`**
4. ✅ **Unique `TestStep[testCaseId, stepNumber]`**
5. ✅ **Unique `TestRun[projectId, code]` dan `[projectId, name]`**
6. ✅ **Index strategy lengkap untuk 15+ query pattern**
7. ✅ **Cascade delete rules eksplisit per relasi**

### Rekomendasi Prioritas:
| Fase | Item | Estimasi |
|------|------|----------|
| **Pre-Prisma** | Fix blocker di atas | 1-2 hari |
| **Sprint 1** | ProjectMember enhancement, TestRun code/counters, Execution timestamps | 3-5 hari |
| **Sprint 2** | ActivityLog, Attachment, Comment, Notification | 1-2 minggu |
| **Sprint 3** | Automation entities (TestScript, AutomationRun, AutomationResult) | 2-3 minggu |

### Catatan Arsitektur:
- Design sudah **mendukung project-based organization** dengan baik
- **Polymorphic relations** (Attachment, Comment, Notification) menggunakan `entityType` + `entityId` pattern yang standar
- **Automation Engine** terpisah tapi terintegrasi via `TestCaseScript` mapping
- **Audit trail** via `ActivityLog` terpisah dari business data - pendekatan yang benar
- Hindari `any` di Prisma schema, gunakan `Json` untuk flexible metadata

---

**Dibuat**: 2026-07-25  
**Reviewer**: Database Design Review Agent  
**Versi**: 2.0