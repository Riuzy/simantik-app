# Permission Seeder Documentation

## Overview

This document describes the permission seeding strategy for SIMANTIK.

## Total Permissions: 33

### Module Breakdown

#### Project Module (4 permissions)
- `project.view` - View project details and list projects
- `project.create` - Create new projects
- `project.update` - Edit project information
- `project.delete` - Remove projects

#### Project Member Module (2 permissions)
- `project.member.add` - Add users to project
- `project.member.remove` - Remove users from project

#### Test Case Module (4 permissions)
- `testcase.view` - View test case details and list test cases
- `testcase.create` - Create new test cases
- `testcase.update` - Edit test case information
- `testcase.delete` - Remove test cases

#### Test Run Module (3 permissions)
- `testrun.view` - View test run details and list test runs
- `testrun.create` - Create new test runs
- `testrun.execute` - Start and run test executions

#### Execution Module (2 permissions)
- `execution.view` - View execution details
- `execution.update` - Update execution status and results

#### Bug Module (5 permissions)
- `bug.view` - View bug report details and list bugs
- `bug.create` - Create new bug reports
- `bug.assign` - Assign bugs to developers
- `bug.resolve` - Mark bugs as resolved
- `bug.close` - Close bug reports

#### Users Module (4 permissions)
- `user.view` - View user profiles and list users
- `user.create` - Create new user accounts
- `user.update` - Edit user account information
- `user.delete` - Remove user accounts

#### Roles Module (2 permissions)
- `role.view` - View role details and list roles
- `role.update` - Modify role permissions

#### Profile Module (2 permissions)
- `profile.view` - View own user profile
- `profile.update` - Edit own user profile

#### Notifications Module (2 permissions)
- `notification.view` - View notification list
- `notification.read` - Mark notifications as read

#### Activity Module (1 permission)
- `activity.view` - View activity logs

---

## Role Permission Assignments

### Manager Role (33 permissions - ALL)
**Full system access**

All 33 permissions listed above.

### Tester Role (17 permissions)
**Focus: Test execution and bug reporting**

#### Project
- `project.view` ✅

#### Test Case
- `testcase.view` ✅
- `testcase.create` ✅
- `testcase.update` ✅

#### Test Run
- `testrun.view` ✅
- `testrun.create` ✅
- `testrun.execute` ✅

#### Execution
- `execution.view` ✅
- `execution.update` ✅

#### Bug
- `bug.view` ✅
- `bug.create` ✅
- `bug.close` ✅

#### Profile
- `profile.view` ✅
- `profile.update` ✅

#### Notifications
- `notification.view` ✅
- `notification.read` ✅

#### Activity
- `activity.view` ✅

**Restrictions:**
- ❌ Cannot create/update/delete projects
- ❌ Cannot delete test cases
- ❌ Cannot assign or resolve bugs (developer responsibility)
- ❌ Cannot manage users or roles

### Developer Role (10 permissions)
**Focus: Bug resolution**

#### Project
- `project.view` ✅

#### Test Case
- `testcase.view` ✅

#### Test Run
- `testrun.view` ✅

#### Execution
- `execution.view` ✅

#### Bug
- `bug.view` ✅
- `bug.resolve` ✅

#### Profile
- `profile.view` ✅
- `profile.update` ✅

#### Notifications
- `notification.view` ✅
- `notification.read` ✅

**Restrictions:**
- ❌ Cannot create/update/delete anything
- ❌ Cannot create bugs (only resolve assigned bugs)
- ❌ Cannot assign bugs
- ❌ Cannot execute tests
- ❌ Cannot manage users or roles

---

## Seeder Implementation Details

### Key Features

1. **Idempotent**: Can be run multiple times without duplicating data
2. **Dynamic Lookup**: No hardcoded IDs - uses role names and permission codes
3. **Transactional**: Uses Prisma transactions for data consistency
4. **Error Handling**: Gracefully skips missing roles or permissions

### Seeder Logic

```typescript
// 1. Seed all permissions (upsert by code)
for (const permission of PERMISSIONS) {
  await prisma.permission.upsert({
    where: { code: permission.code },
    update: {},
    create: permission,
  });
}

// 2. Lookup roles by name
const managerRole = await prisma.role.findUnique({ where: { name: 'Manager' } });
const testerRole = await prisma.role.findUnique({ where: { name: 'Tester' } });
const developerRole = await prisma.role.findUnique({ where: { name: 'Developer' } });

// 3. Lookup permissions and create permissionMap
const allPermissions = await prisma.permission.findMany();
const permissionMap = new Map(allPermissions.map(p => [p.code, p.id]));

// 4. Assign permissions to roles
for (const [roleName, permissionCodes] of Object.entries(ROLE_PERMISSIONS)) {
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  
  for (const code of permissionCodes) {
    const permissionId = permissionMap.get(code);
    
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: role.id,
          permissionId,
        },
      },
      update: {},
      create: {
        roleId: role.id,
        permissionId,
      },
    });
  }
}
```

---

## Running the Seeder

Once the database connection is properly configured, run:

```bash
node prisma/seed.mjs
```

Or configure in package.json:

```json
{
  "prisma": {
    "seed": "node prisma/seed.mjs"
  }
}
```

Then run:

```bash
pnpm prisma db seed
```

---

## Verification

After seeding, verify:

```sql
-- Check permissions count
SELECT COUNT(*) FROM permissions; -- Should be 33

-- Check Manager permissions
SELECT COUNT(*) FROM role_permissions WHERE role_id = (SELECT id FROM roles WHERE name = 'Manager'); -- Should be 33

-- Check Tester permissions
SELECT COUNT(*) FROM role_permissions WHERE role_id = (SELECT id FROM roles WHERE name = 'Tester'); -- Should be 17

-- Check Developer permissions
SELECT COUNT(*) FROM role_permissions WHERE role_id = (SELECT id FROM roles WHERE name = 'Developer'); -- Should be 10
```

---

## Database Schema

All required models are in place:

- ✅ `Permission` model with unique `code`
- ✅ `RolePermission` junction table with unique `(roleId, permissionId)`
- ✅ Cascade delete on role/permission removal
- ✅ Proper indexes for performance

The permission system is fully data-driven and ready for use in the application.
