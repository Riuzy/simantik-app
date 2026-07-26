# ERD - SIMANTIK

## Entity Relationship Diagram

### Role
- **Deskripsi:** Merepresentasikan peran global pengguna dalam sistem.
- **Role:** Manager, Tester, Developer
- **Atribut:** id, name, createdAt, updatedAt, deletedAt
- **Relasi:**
  - Memiliki relasi one-to-many dengan User

### User
- **Deskripsi:** Merepresentasikan pengguna sistem.
- **Atribut:** id, name, email, password, isActive, roleId, createdAt, updatedAt, deletedAt
- **Relasi:**
  - Memiliki relasi many-to-one dengan Role
  - Memiliki relasi one-to-many dengan ProjectMember
  - Memiliki relasi one-to-many dengan Project (sebagai creator)

### Project
- **Deskripsi:** Container utama untuk aktivitas pengujian.
- **Atribut:** id, name, slug, description, createdById, createdAt, updatedAt, deletedAt
- **Relasi:**
  - Memiliki relasi many-to-one dengan User (sebagai creator)
  - Memiliki relasi one-to-many dengan ProjectMember
  - Memiliki relasi one-to-many dengan TestCase
  - Memiliki relasi one-to-many dengan TestRun
  - Memiliki relasi one-to-many dengan BugReport

### ProjectMember
- **Deskripsi:** Merepresentasikan keanggotaan pengguna dalam project.
- **Atribut:** id, projectId, userId, joinedAt, createdAt, updatedAt
- **Relasi:**
  - Memiliki relasi many-to-one dengan Project
  - Memiliki relasi many-to-one dengan User
- **Constraints:**
  - Kombinasi User ID dan Project ID harus unique

---

## Relasi Utama

### User → Role
- **Tipe:** Many-to-One
- **Foreign Key:** `role_id` pada tabel User
- **Deskripsi:** Setiap user memiliki satu global role (Manager, Tester, atau Developer)

### User → ProjectMember
- **Tipe:** One-to-Many
- **Foreign Key:** `user_id` pada tabel ProjectMember

### Project → ProjectMember
- **Tipe:** One-to-Many
- **Foreign Key:** `project_id` pada tabel ProjectMember

### User → Project (Creator)
- **Tipe:** One-to-Many
- **Foreign Key:** `created_by_id` pada tabel Project

---

## Index Strategy

| Tabel | Index | Tujuan |
|-------|-------|--------|
| users | role_id | Filter user by role |
| users | email | Lookup by email (login) |
| users | is_active | Filter active users |
| users | deleted_at | Soft delete filter |
| projects | created_by_id | Query project by creator |
| projects | deleted_at | Soft delete filter |
| project_members | project_id | Query members by project |
| project_members | user_id | Query projects by user |
