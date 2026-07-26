# Domain Model - SIMANTIK

## Overview

SIMANTIK adalah sistem manajemen pengujian yang komprehensif yang dirancang untuk membantu organisasi merencanakan, mengeksekusi, dan melacak aktivitas pengujian perangkat lunak. Sistem ini memungkinkan tim untuk mengorganisir test case, mengelola test run, melacak hasil eksekusi, dan melaporkan bug dalam project yang terstruktur.

Platform ini mendukung alur kerja pengujian kolaboratif di mana manajer mengawasi project, dan anggota tim (tester dan developer) bekerja sama untuk memastikan kualitas perangkat lunak melalui manajemen test case dan pelacakan eksekusi yang sistematis.

---

## 1. Global Role

### Manager
- Membuat dan mengelola project
- Mengundang pengguna ke project
- Mengawasi semua project

### Tester
- Membuat Test Case
- Mengeksekusi Test Run
- Membuat Bug Report
- Bergabung dengan project ketika diundang

### Developer
- Melihat project yang ditugaskan
- Memperbarui status bug
- Bergabung dengan project ketika diundang

---

## 2. User

Setiap user memiliki satu global role. User diundang ke project oleh Manager melalui ProjectMember.

---

## 3. Project

Project adalah container logis yang mengelompokkan aktivitas pengujian terkait.

**Karakteristik:**
- Dibuat oleh Manager
- Memiliki sekelompok anggota (ProjectMember)
- Berisi Test Case, Test Run, dan Bug Report

---

## 4. ProjectMember

ProjectMember menghubungkan User ke Project. User tidak memiliki role terpisah di dalam project; semua tanggung jawab ditentukan oleh global role mereka.

---

## Alur Kerja

1. **Manager** membuat project
2. **Manager** mengundang user ke project (menambahkan ProjectMember)
3. **Tester** membuat test case dan mengeksekusi test run
4. **Tester** melaporkan bug
5. **Developer** melihat bug yang ditugaskan dan memperbarui statusnya

---

## Hierarki Entitas

```
Role
│
└── User
        │
        └── ProjectMember
                    │
                    └── Project
                                │
                                ├── TestCase
                                ├── TestStep
                                ├── TestRun
                                ├── Execution
                                └── BugReport
```

---

## Ringkasan

- **Global Role:** Manager, Tester, Developer
- **Tidak ada konsep Workspace**
- **Project** adalah container utama
- **ProjectMember** menghubungkan user ke project
- **Akses ditentukan oleh global role**, bukan role per-project
