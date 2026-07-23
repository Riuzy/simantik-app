# Entity Relationship Diagram (ERD)

## Gambaran Umum

Dokumen ini menjelaskan perancangan hubungan antar entitas pada database SIMANTIK.

## Daftar Entitas

### Role

**Fungsi:**
Entitas Role merepresentasikan peran global yang dimiliki pengguna dalam sistem SIMANTIK. Role menentukan tingkat akses dan otoritas pengguna pada level sistem, yaitu Manager dan Employee.

**Hubungan dengan entitas lain:**
- Memiliki relasi one-to-many dengan User (satu role dapat dimiliki oleh banyak user)
- Menentukan hak akses dasar pengguna sebelum mereka bergabung ke workspace

---

### User

**Fungsi:**
Entitas User merepresentasikan pengguna sistem SIMANTIK yang dapat mengakses aplikasi. User menyimpan informasi identitas, kredensial, dan role global pengguna.

**Hubungan dengan entitas lain:**
- Memiliki relasi many-to-one dengan Role (setiap user memiliki satu role global)
- Memiliki relasi one-to-many dengan Workspace (sebagai owner/creator)
- Memiliki relasi one-to-many dengan Workspace Member (satu user dapat menjadi anggota di banyak workspace)
- Memiliki relasi one-to-many dengan Test Case (sebagai creator)
- Memiliki relasi one-to-many dengan Test Run (sebagai creator dan assigned tester)
- Memiliki relasi one-to-many dengan Execution (sebagai executor)
- Memiliki relasi one-to-many dengan Bug Report (sebagai reporter dan assignee)

---

### Workspace

**Fungsi:**
Entitas Workspace merepresentasikan unit organisasi utama dalam SIMANTIK. Workspace berfungsi sebagai lingkungan kerja terisolasi di mana tim dapat berkolaborasi dalam aktivitas pengujian.

**Hubungan dengan entitas lain:**
- Memiliki relasi many-to-one dengan User (sebagai owner yang membuat workspace)
- Memiliki relasi one-to-many dengan Workspace Member (satu workspace memiliki banyak anggota)
- Memiliki relasi one-to-many dengan Project (satu workspace berisi banyak project)

---

### Workspace Role

**Fungsi:**
Entitas Workspace Role merepresentasikan peran yang dimiliki pengguna dalam konteks workspace tertentu, yaitu Tester dan Developer. Role ini menentukan izin dan tanggung jawab pengguna di dalam workspace.

**Hubungan dengan entitas lain:**
- Memiliki relasi one-to-many dengan Workspace Member (satu workspace role dapat diberikan kepada banyak anggota)
- Menentukan hak akses pengguna dalam workspace (create test case, execute test, view bug, dll)

---

### Workspace Member

**Fungsi:**
Entitas Workspace Member merepresentasikan keanggotaan pengguna dalam workspace tertentu. Entitas ini berfungsi sebagai junction table yang menghubungkan User, Workspace, dan Workspace Role.

**Hubungan dengan entitas lain:**
- Memiliki relasi many-to-one dengan User (menghubungkan member ke user)
- Memiliki relasi many-to-one dengan Workspace (menghubungkan member ke workspace)
- Memiliki relasi many-to-one dengan Workspace Role (setiap member memiliki satu role dalam workspace)

---

### Project

**Fungsi:**
Entitas Project merepresentasikan pengelompokan logis aktivitas pengujian dalam workspace. Project berfungsi sebagai container untuk test case, test run, dan bug report yang terkait dengan aplikasi atau fitur tertentu.

**Hubungan dengan entitas lain:**
- Memiliki relasi many-to-one dengan Workspace (setiap project termasuk dalam satu workspace)
- Memiliki relasi one-to-many dengan Test Case (satu project berisi banyak test case)
- Memiliki relasi one-to-many dengan Test Run (satu project memiliki banyak test run)
- Memiliki relasi one-to-many dengan Bug Report (satu project memiliki banyak bug report)

---

### Test Case

**Fungsi:**
Entitas Test Case merepresentasikan skenario pengujian spesifik yang akan dieksekusi. Test Case berfungsi untuk mendokumentasikan langkah-langkah pengujian, kondisi awal, dan hasil yang diharapkan.

**Hubungan dengan entitas lain:**
- Memiliki relasi many-to-one dengan Project (setiap test case termasuk dalam satu project)
- Memiliki relasi many-to-one dengan User (sebagai creator)
- Memiliki relasi one-to-many dengan Test Step (satu test case berisi banyak test step)
- Memiliki relasi many-to-many dengan Test Run (satu test case dapat dieksekusi dalam banyak test run)
- Memiliki relasi one-to-many dengan Execution (satu test case dapat memiliki banyak execution record)
- Memiliki relasi one-to-many dengan Bug Report (satu test case dapat dikaitkan dengan banyak bug)

---

### Test Step

**Fungsi:**
Entitas Test Step merepresentasikan langkah individual dalam test case. Test Step berfungsi untuk memecah test case menjadi instruksi yang lebih detail dan terukur.

**Hubungan dengan entitas lain:**
- Memiliki relasi many-to-one dengan Test Case (setiap test step termasuk dalam satu test case)
- Memiliki relasi one-to-many dengan Execution Result (satu test step dapat memiliki banyak execution result dari berbagai eksekusi)

---

### Test Run

**Fungsi:**
Entitas Test Run merepresentasikan sesi eksekusi pengujian yang direncanakan. Test Run berfungsi untuk mengelompokkan test case yang akan dieksekusi dalam satu periode atau sprint tertentu.

**Hubungan dengan entitas lain:**
- Memiliki relasi many-to-one dengan Project (setiap test run termasuk dalam satu project)
- Memiliki relasi many-to-one dengan User (sebagai creator dan assigned tester)
- Memiliki relasi many-to-many dengan Test Case (satu test run mencakup banyak test case)
- Memiliki relasi one-to-many dengan Execution (satu test run menghasilkan banyak execution record)

---

### Execution

**Fungsi:**
Entitas Execution merepresentasikan record eksekusi aktual dari test case dalam test run. Execution berfungsi untuk mencatat hasil, status, waktu, dan detail pelaksanaan pengujian.

**Hubungan dengan entitas lain:**
- Memiliki relasi many-to-one dengan Test Run (setiap execution termasuk dalam satu test run)
- Memiliki relasi many-to-one dengan Test Case (setiap execution mengeksekusi satu test case)
- Memiliki relasi many-to-one dengan User (sebagai executor)
- Memiliki relasi one-to-many dengan Execution Result (satu execution memiliki banyak execution result untuk setiap step)
- Memiliki relasi one-to-many dengan Bug Report (satu execution dapat menghasilkan banyak bug report)

---

### Execution Result

**Fungsi:**
Entitas Execution Result merepresentasikan hasil eksekusi individual untuk setiap test step dalam execution. Execution Result berfungsi untuk memberikan detail hasil pengujian pada level langkah demi langkah.

**Hubungan dengan entitas lain:**
- Memiliki relasi many-to-one dengan Execution (setiap execution result termasuk dalam satu execution)
- Memiliki relasi many-to-one dengan Test Step (setiap execution result mereferensikan satu test step)

---

### Bug Report

**Fungsi:**
Entitas Bug Report merepresentasikan defect atau masalah yang ditemukan selama eksekusi pengujian. Bug Report berfungsi untuk mendokumentasikan, melacak, dan mengelola proses penyelesaian bug.

**Hubungan dengan entitas lain:**
- Memiliki relasi many-to-one dengan Project (setiap bug report termasuk dalam satu project)
- Memiliki relasi many-to-one dengan Execution (opsional - menghubungkan bug ke execution tertentu)
- Memiliki relasi many-to-one dengan Test Case (opsional - menghubungkan bug ke test case tertentu)
- Memiliki relasi many-to-one dengan User (sebagai reporter dan assignee)

---

## Relasi Antar Entitas

Bagian ini menjelaskan secara detail hubungan antar entitas dalam database SIMANTIK berdasarkan tipe relasinya.

### Relasi One-to-Many

Relasi one-to-many terjadi ketika satu record dari entitas induk dapat memiliki banyak record terkait pada entitas anak, namun setiap record pada entitas anak hanya terkait dengan satu record pada entitas induk.

#### Role → User
- **Kardinalitas:** 1:N
- **Penjelasan:** Satu role (Manager atau Employee) dapat dimiliki oleh banyak user, tetapi setiap user hanya memiliki satu role global.
- **Foreign Key:** `role_id` pada tabel User

#### User → Workspace
- **Kardinalitas:** 1:N
- **Penjelasan:** Satu user (Manager) dapat membuat dan memiliki banyak workspace, tetapi setiap workspace hanya dimiliki oleh satu user.
- **Foreign Key:** `owner_id` pada tabel Workspace

#### User → Workspace Member
- **Kardinalitas:** 1:N
- **Penjelasan:** Satu user dapat menjadi anggota di banyak workspace, tetapi setiap keanggotaan mereferensikan satu user.
- **Foreign Key:** `user_id` pada tabel Workspace Member

#### Workspace → Workspace Member
- **Kardinalitas:** 1:N
- **Penjelasan:** Satu workspace dapat memiliki banyak anggota, tetapi setiap keanggotaan mereferensikan satu workspace.
- **Foreign Key:** `workspace_id` pada tabel Workspace Member

#### Workspace Role → Workspace Member
- **Kardinalitas:** 1:N
- **Penjelasan:** Satu workspace role (Tester atau Developer) dapat diberikan kepada banyak workspace member, tetapi setiap workspace member hanya memiliki satu workspace role.
- **Foreign Key:** `workspace_role_id` pada tabel Workspace Member

#### Workspace → Project
- **Kardinalitas:** 1:N
- **Penjelasan:** Satu workspace dapat berisi banyak project, tetapi setiap project hanya termasuk dalam satu workspace.
- **Foreign Key:** `workspace_id` pada tabel Project

#### Project → Test Case
- **Kardinalitas:** 1:N
- **Penjelasan:** Satu project dapat berisi banyak test case, tetapi setiap test case hanya termasuk dalam satu project.
- **Foreign Key:** `project_id` pada tabel Test Case

#### User → Test Case
- **Kardinalitas:** 1:N
- **Penjelasan:** Satu user (Tester) dapat membuat banyak test case, tetapi setiap test case hanya dibuat oleh satu user.
- **Foreign Key:** `created_by` pada tabel Test Case

#### Test Case → Test Step
- **Kardinalitas:** 1:N
- **Penjelasan:** Satu test case dapat berisi banyak test step, tetapi setiap test step hanya termasuk dalam satu test case.
- **Foreign Key:** `test_case_id` pada tabel Test Step

#### Project → Test Run
- **Kardinalitas:** 1:N
- **Penjelasan:** Satu project dapat memiliki banyak test run, tetapi setiap test run hanya termasuk dalam satu project.
- **Foreign Key:** `project_id` pada tabel Test Run

#### User → Test Run (Created By)
- **Kardinalitas:** 1:N
- **Penjelasan:** Satu user dapat membuat banyak test run, tetapi setiap test run hanya dibuat oleh satu user.
- **Foreign Key:** `created_by` pada tabel Test Run

#### User → Test Run (Assigned To)
- **Kardinalitas:** 1:N
- **Penjelasan:** Satu user (Tester) dapat ditugaskan pada banyak test run, tetapi setiap test run hanya ditugaskan kepada satu user.
- **Foreign Key:** `assigned_to` pada tabel Test Run

#### Test Run → Execution
- **Kardinalitas:** 1:N
- **Penjelasan:** Satu test run dapat menghasilkan banyak execution (satu untuk setiap test case yang dieksekusi), tetapi setiap execution hanya termasuk dalam satu test run.
- **Foreign Key:** `test_run_id` pada tabel Execution

#### Test Case → Execution
- **Kardinalitas:** 1:N
- **Penjelasan:** Satu test case dapat dieksekusi berkali-kali dalam berbagai test run, menghasilkan banyak execution record, tetapi setiap execution hanya mengeksekusi satu test case.
- **Foreign Key:** `test_case_id` pada tabel Execution

#### User → Execution
- **Kardinalitas:** 1:N
- **Penjelasan:** Satu user (Tester) dapat melakukan banyak execution, tetapi setiap execution hanya dilakukan oleh satu user.
- **Foreign Key:** `executed_by` pada tabel Execution

#### Execution → Execution Result
- **Kardinalitas:** 1:N
- **Penjelasan:** Satu execution dapat memiliki banyak execution result (satu untuk setiap test step), tetapi setiap execution result hanya termasuk dalam satu execution.
- **Foreign Key:** `execution_id` pada tabel Execution Result

#### Test Step → Execution Result
- **Kardinalitas:** 1:N
- **Penjelasan:** Satu test step dapat memiliki banyak execution result dari berbagai eksekusi, tetapi setiap execution result hanya mereferensikan satu test step.
- **Foreign Key:** `test_step_id` pada tabel Execution Result

#### Project → Bug Report
- **Kardinalitas:** 1:N
- **Penjelasan:** Satu project dapat memiliki banyak bug report, tetapi setiap bug report hanya termasuk dalam satu project.
- **Foreign Key:** `project_id` pada tabel Bug Report

#### Execution → Bug Report
- **Kardinalitas:** 1:N (Optional)
- **Penjelasan:** Satu execution dapat menghasilkan banyak bug report (jika ditemukan beberapa bug), tetapi setiap bug report dapat dikaitkan dengan satu execution. Relasi ini bersifat opsional karena bug dapat dilaporkan secara manual tanpa execution.
- **Foreign Key:** `execution_id` pada tabel Bug Report (nullable)

#### Test Case → Bug Report
- **Kardinalitas:** 1:N (Optional)
- **Penjelasan:** Satu test case dapat dikaitkan dengan banyak bug report, tetapi setiap bug report dapat dikaitkan dengan satu test case. Relasi ini bersifat opsional.
- **Foreign Key:** `test_case_id` pada tabel Bug Report (nullable)

#### User → Bug Report (Reporter)
- **Kardinalitas:** 1:N
- **Penjelasan:** Satu user (Tester) dapat melaporkan banyak bug, tetapi setiap bug report hanya dilaporkan oleh satu user.
- **Foreign Key:** `reported_by` pada tabel Bug Report

#### User → Bug Report (Assignee)
- **Kardinalitas:** 1:N
- **Penjelasan:** Satu user (Developer) dapat ditugaskan untuk menangani banyak bug, tetapi setiap bug report hanya ditugaskan kepada satu user.
- **Foreign Key:** `assigned_to` pada tabel Bug Report

---

### Relasi Many-to-Many

Relasi many-to-many terjadi ketika banyak record dari satu entitas dapat terkait dengan banyak record dari entitas lain. Relasi ini diimplementasikan menggunakan junction table (tabel perantara).

#### Test Case ↔ Test Run
- **Kardinalitas:** M:N
- **Penjelasan:** Satu test case dapat disertakan dalam banyak test run, dan satu test run dapat mencakup banyak test case. Relasi ini memungkinkan fleksibilitas dalam mengorganisir pengujian.
- **Implementasi:** Memerlukan junction table `test_run_test_cases` yang menyimpan:
  - `test_run_id` (foreign key ke Test Run)
  - `test_case_id` (foreign key ke Test Case)
  - Atribut tambahan seperti urutan eksekusi atau prioritas dalam test run
- **Contoh:** Test case "Login dengan kredensial valid" dapat dieksekusi dalam test run "Sprint 1 Testing", "Regression Testing", dan "Smoke Testing".

---

### Relasi One-to-One

Dalam desain database SIMANTIK saat ini, tidak terdapat relasi one-to-one secara eksplisit. Semua relasi dirancang sebagai one-to-many atau many-to-many untuk memberikan fleksibilitas dan skalabilitas sistem.

**Pertimbangan:**
- Relasi one-to-one biasanya digunakan untuk memisahkan data yang jarang diakses atau untuk alasan keamanan (misalnya, memisahkan informasi sensitif).
- Dalam konteks SIMANTIK, semua entitas dirancang untuk mendukung operasi kolaboratif dan historis, sehingga relasi one-to-many lebih sesuai.
