# SIMANTIK Domain Model

## 1. Gambaran Umum

SIMANTIK adalah sistem manajemen pengujian yang komprehensif yang dirancang untuk membantu organisasi merencanakan, mengeksekusi, dan melacak aktivitas pengujian perangkat lunak. Sistem ini memungkinkan tim untuk mengorganisir test case, mengelola test run, melacak hasil eksekusi, dan melaporkan bug dalam workspace dan project yang terstruktur.

Platform ini mendukung alur kerja pengujian kolaboratif di mana manajer mengawasi workspace, dan anggota tim (tester dan developer) bekerja sama untuk memastikan kualitas perangkat lunak melalui manajemen test case dan pelacakan eksekusi yang sistematis.

---

## 2. Role Global

### Manager

Manager adalah role global dengan tingkat otoritas tertinggi dalam sistem.

**Tanggung Jawab:**
- Membuat dan mengelola workspace
- Mengundang pengguna ke workspace
- Menetapkan workspace role kepada anggota
- Mengawasi semua project dalam workspace mereka
- Memantau aktivitas dan kemajuan pengujian secara keseluruhan
- Mengelola pengaturan dan izin tingkat workspace

### Employee

Employee adalah role global standar untuk pengguna yang berpartisipasi dalam aktivitas pengujian.

**Tanggung Jawab:**
- Bergabung dengan workspace ketika diundang
- Bekerja dalam workspace role yang ditetapkan
- Berkolaborasi pada project dan test case
- Mengeksekusi pengujian yang ditugaskan
- Melaporkan dan melacak bug

---

## 3. Workspace

Workspace adalah unit organisasi utama dalam SIMANTIK. Workspace merepresentasikan lingkungan kerja yang didedikasikan di mana tim berkolaborasi pada aktivitas pengujian.

**Karakteristik Utama:**
- Dibuat dan dimiliki oleh Manager
- Berisi beberapa project
- Memiliki sekelompok anggota dengan workspace role spesifik
- Menyediakan isolasi antara tim atau departemen yang berbeda
- Berfungsi sebagai konteks untuk semua aktivitas pengujian

**Tujuan:**
Workspace memungkinkan organisasi untuk memisahkan upaya pengujian berdasarkan tim, departemen, lini produk, atau batasan logis lainnya. Setiap workspace beroperasi secara independen dengan project, test case, dan anggota timnya sendiri.

---

## 4. Workspace Role

Setelah pengguna bergabung dengan workspace, mereka diberi workspace role spesifik yang menentukan izin dan tanggung jawab mereka dalam workspace tersebut.

### Tester

Role Tester bertanggung jawab atas aktivitas quality assurance.

**Tanggung Jawab:**
- Membuat dan memelihara test case
- Mendefinisikan test step dan hasil yang diharapkan
- Membuat dan mengelola test run
- Mengeksekusi test case dan mencatat hasil
- Melaporkan bug yang ditemukan selama pengujian
- Memperbarui status eksekusi pengujian
- Meninjau dan memvalidasi cakupan pengujian

### Developer

Role Developer bertanggung jawab untuk menangani masalah yang ditemukan selama pengujian.

**Tanggung Jawab:**
- Melihat test case dan test run
- Meninjau hasil eksekusi
- Mengakses bug report yang ditugaskan kepada mereka
- Memahami kegagalan pengujian dan persyaratan
- Berkolaborasi dengan tester pada penyelesaian masalah
- Memberikan umpan balik tentang akurasi test case

---

## 5. Project

Project adalah container logis dalam workspace yang mengelompokkan aktivitas pengujian terkait.

**Karakteristik Utama:**
- Termasuk dalam satu workspace
- Berisi beberapa test case
- Merepresentasikan aplikasi, fitur, atau rilis tertentu
- Memiliki test run dan riwayat eksekusinya sendiri
- Dapat digunakan untuk mengorganisir pengujian berdasarkan produk, modul, atau sprint

**Tujuan:**
Project membantu tim mengorganisir upaya pengujian mereka ke dalam unit yang dapat dikelola. Misalnya, sebuah workspace mungkin berisi project terpisah untuk aplikasi, versi, atau fitur utama yang berbeda yang sedang diuji.

---

## 6. Alur Pengujian

Alur kerja pengujian SIMANTIK mengikuti struktur hierarkis:

```
Manager
    ↓
Membuat Workspace
    ↓
Mengundang Anggota (Menetapkan Workspace Role)
    ↓
Membuat Project
    ↓
Tester Membuat Test Case (dengan Test Step)
    ↓
Tester Membuat Test Run (memilih Test Case)
    ↓
Tester Mengeksekusi Test Run (mencatat Execution Result)
    ↓
Tester Melaporkan Bug (jika pengujian gagal)
```

**Penjelasan Alur Kerja:**

1. **Manager** membuat workspace untuk tim
2. **Manager** mengundang employee dan menetapkan workspace role kepada mereka (Tester/Developer)
3. **Manager atau Tester** membuat project dalam workspace
4. **Tester** membuat test case dengan test step yang detail
5. **Tester** membuat test run dengan memilih test case yang relevan
6. **Tester** mengeksekusi test run dan mencatat hasil untuk setiap test case
7. **Tester** membuat bug report untuk test case yang gagal
8. **Developer** meninjau bug dan hasil eksekusi
9. Siklus berulang saat masalah diperbaiki dan diuji kembali

---

## 7. Relasi Entitas

### User

Merepresentasikan seseorang yang menggunakan sistem SIMANTIK.

**Atribut:**
- Identifier unik
- Nama dan email
- Password (ter-hash)
- Role global (Manager atau Employee)
- Status akun (aktif/nonaktif)
- Timestamp pembuatan dan pembaruan

**Relasi:**
- Memiliki satu role global
- Dapat menjadi anggota dari beberapa workspace
- Dapat memiliki workspace role yang berbeda di workspace yang berbeda

---

### Role

Merepresentasikan role global yang ditetapkan kepada pengguna.

**Jenis:**
- Manager
- Employee

**Tujuan:**
Menentukan tindakan apa yang dapat dilakukan pengguna pada tingkat sistem (misalnya, membuat workspace).

---

### Workspace

Merepresentasikan lingkungan kolaboratif untuk aktivitas pengujian.

**Atribut:**
- Identifier unik
- Nama dan deskripsi
- Owner (Manager yang membuatnya)
- Timestamp pembuatan dan pembaruan
- Status (aktif/diarsipkan)

**Relasi:**
- Dimiliki oleh satu Manager
- Berisi beberapa project
- Memiliki beberapa workspace member
- Setiap anggota memiliki satu workspace role

---

### Workspace Member

Merepresentasikan keanggotaan pengguna dalam workspace tertentu.

**Atribut:**
- Referensi User
- Referensi Workspace
- Referensi Workspace Role
- Tanggal bergabung
- Status (aktif/nonaktif)

**Relasi:**
- Menghubungkan User ke Workspace
- Memiliki satu Workspace Role
- Dibuat oleh owner Workspace (Manager)

---

### Workspace Role

Merepresentasikan role yang dimiliki pengguna dalam workspace tertentu.

**Jenis:**
- Tester
- Developer

**Tujuan:**
Menentukan tindakan apa yang dapat dilakukan pengguna dalam workspace tersebut (misalnya, membuat test case, mengeksekusi pengujian, melihat bug).

---

### Project

Merepresentasikan pengelompokan logis test case dalam workspace.

**Atribut:**
- Identifier unik
- Nama dan deskripsi
- Referensi Workspace
- Kode atau identifier project
- Timestamp pembuatan dan pembaruan
- Status (aktif/selesai/diarsipkan)

**Relasi:**
- Termasuk dalam satu Workspace
- Berisi beberapa Test Case
- Memiliki beberapa Test Run

---

### Test Case

Merepresentasikan skenario pengujian spesifik yang akan dieksekusi.

**Atribut:**
- Identifier unik
- Judul dan deskripsi
- Referensi Project
- Prioritas (rendah/sedang/tinggi/kritis)
- Tipe pengujian (fungsional/regresi/smoke/integrasi/dll.)
- Prakondisi
- Hasil yang diharapkan
- Dibuat oleh (Tester)
- Timestamp pembuatan dan pembaruan
- Status (draft/aktif/deprecated)

**Relasi:**
- Termasuk dalam satu Project
- Berisi beberapa Test Step
- Dapat disertakan dalam beberapa Test Run
- Menghasilkan Execution Result ketika dieksekusi
- Dapat dikaitkan dengan Bug Report

---

### Test Step

Merepresentasikan satu langkah dalam test case.

**Atribut:**
- Identifier unik
- Referensi Test Case
- Nomor langkah (urutan)
- Deskripsi tindakan
- Hasil yang diharapkan
- Timestamp pembuatan dan pembaruan

**Relasi:**
- Termasuk dalam satu Test Case
- Urutan berurutan dalam test case

---

### Test Run

Merepresentasikan sesi eksekusi yang direncanakan untuk serangkaian test case.

**Atribut:**
- Identifier unik
- Nama dan deskripsi
- Referensi Project
- Dibuat oleh (Tester)
- Ditugaskan kepada (Tester)
- Tanggal mulai dan tanggal jatuh tempo
- Status (direncanakan/sedang-berlangsung/selesai/dibatalkan)
- Environment (production/staging/development)
- Build atau nomor versi
- Timestamp pembuatan dan pembaruan

**Relasi:**
- Termasuk dalam satu Project
- Mencakup beberapa Test Case
- Menghasilkan beberapa Execution (satu per test case)
- Dibuat dan dikelola oleh Tester

---

### Execution

Merepresentasikan eksekusi test case tunggal dalam test run.

**Atribut:**
- Identifier unik
- Referensi Test Run
- Referensi Test Case
- Dieksekusi oleh (Tester)
- Tanggal dan waktu eksekusi
- Status (belum-dimulai/sedang-berlangsung/lulus/gagal/diblokir/dilewati)
- Hasil aktual
- Catatan atau komentar
- Durasi
- Timestamp pembuatan dan pembaruan

**Relasi:**
- Termasuk dalam satu Test Run
- Mengeksekusi satu Test Case
- Dapat memiliki beberapa Execution Result (jika langkah dilacak secara individual)
- Dapat menghasilkan Bug Report (jika gagal)

---

### Execution Result

Merepresentasikan hasil eksekusi test step individual dalam execution.

**Atribut:**
- Identifier unik
- Referensi Execution
- Referensi Test Step
- Status (lulus/gagal/dilewati)
- Hasil aktual
- Referensi screenshot atau attachment
- Catatan
- Timestamp

**Relasi:**
- Termasuk dalam satu Execution
- Mereferensikan satu Test Step
- Menyediakan hasil langkah demi langkah yang detail

---

### Bug Report

Merepresentasikan defect atau masalah yang ditemukan selama eksekusi pengujian.

**Atribut:**
- Identifier unik
- Judul dan deskripsi
- Referensi Project
- Referensi Execution (opsional - menghubungkan ke eksekusi di mana bug ditemukan)
- Referensi Test Case (opsional)
- Dilaporkan oleh (Tester)
- Ditugaskan kepada (Developer)
- Severity (rendah/sedang/tinggi/kritis)
- Prioritas (rendah/sedang/tinggi)
- Status (terbuka/sedang-berlangsung/terselesaikan/ditutup/dibuka-kembali)
- Langkah untuk mereproduksi
- Perilaku yang diharapkan vs aktual
- Informasi environment
- Attachment atau screenshot
- Timestamp pembuatan dan pembaruan
- Catatan penyelesaian

**Relasi:**
- Termasuk dalam satu Project
- Dapat dikaitkan dengan satu Execution
- Dapat dikaitkan dengan satu Test Case
- Dilaporkan oleh Tester
- Ditugaskan kepada Developer
- Dapat memiliki beberapa attachment

---

## 8. Modul Masa Depan

### Automation Engine

Modul untuk mendukung eksekusi pengujian otomatis.

**Fitur:**
- Integrasi dengan framework test automation
- Eksekusi test case otomatis
- Test run terjadwal
- Integrasi CI/CD pipeline
- Pelaporan hasil otomatis

### Reports

Modul pelaporan dan analitik yang komprehensif.

**Fitur:**
- Dashboard eksekusi pengujian
- Grafik tingkat lulus/gagal
- Laporan cakupan pengujian
- Analisis tren bug
- Metrik kinerja tim
- Pembuatan laporan kustom
- Kemampuan ekspor (PDF/Excel)

### Notifications

Mekanisme notifikasi sistem.

**Fitur:**
- Notifikasi email
- Notifikasi dalam aplikasi
- Peringatan untuk penugasan test run
- Notifikasi penugasan bug
- Pembaruan status eksekusi pengujian
- Notifikasi undangan workspace
- Preferensi notifikasi yang dapat dikustomisasi

### Attachments

Dukungan untuk attachment file di seluruh sistem.

**Fitur:**
- Upload screenshot dan file
- Lampirkan file ke test case
- Lampirkan bukti ke execution
- Lampirkan file ke bug report
- Versioning file
- Manajemen penyimpanan

### Comments

Sistem komentar kolaboratif.

**Fitur:**
- Komentar pada test case
- Komentar pada execution
- Komentar pada bug report
- Diskusi thread
- Mention dan notifikasi
- Riwayat dan editing komentar

---

## Ringkasan

SIMANTIK menyediakan pendekatan terstruktur dan hierarkis untuk manajemen pengujian:

- **Tingkat Global:** Pengguna dengan role (Manager/Employee)
- **Tingkat Workspace:** Lingkungan terisolasi dengan workspace role (Tester/Developer)
- **Tingkat Project:** Pengelompokan logis aktivitas pengujian
- **Tingkat Test Case:** Skenario pengujian detail dengan langkah-langkah
- **Tingkat Execution:** Test run dan hasil aktual
- **Pelacakan Bug:** Alur kerja pelaporan dan penyelesaian masalah

Domain model ini mendukung alur kerja pengujian kolaboratif, pemisahan role yang jelas, dan pelacakan komprehensif aktivitas pengujian dari perencanaan hingga eksekusi hingga penyelesaian bug.
