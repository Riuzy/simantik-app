import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PERMISSIONS = [
  // Project module (4)
  { code: 'project.view', title: 'View Project', description: 'View project details and list projects', module: 'project' },
  { code: 'project.create', title: 'Create Project', description: 'Create new projects', module: 'project' },
  { code: 'project.update', title: 'Update Project', description: 'Edit project information', module: 'project' },
  { code: 'project.delete', title: 'Delete Project', description: 'Remove projects', module: 'project' },

  // Project Member module (2)
  { code: 'project.member.add', title: 'Add Project Member', description: 'Add users to project', module: 'project_member' },
  { code: 'project.member.remove', title: 'Remove Project Member', description: 'Remove users from project', module: 'project_member' },

  // Test Case module (4)
  { code: 'testcase.view', title: 'View Test Case', description: 'View test case details and list test cases', module: 'testcase' },
  { code: 'testcase.create', title: 'Create Test Case', description: 'Create new test cases', module: 'testcase' },
  { code: 'testcase.update', title: 'Update Test Case', description: 'Edit test case information', module: 'testcase' },
  { code: 'testcase.delete', title: 'Delete Test Case', description: 'Remove test cases', module: 'testcase' },

  // Test Run module (3)
  { code: 'testrun.view', title: 'View Test Run', description: 'View test run details and list test runs', module: 'testrun' },
  { code: 'testrun.create', title: 'Create Test Run', description: 'Create new test runs', module: 'testrun' },
  { code: 'testrun.execute', title: 'Execute Test Run', description: 'Start and run test executions', module: 'testrun' },

  // Execution module (2)
  { code: 'execution.view', title: 'View Execution', description: 'View execution details', module: 'execution' },
  { code: 'execution.update', title: 'Update Execution', description: 'Update execution status and results', module: 'execution' },

  // Bug module (5)
  { code: 'bug.view', title: 'View Bug', description: 'View bug report details and list bugs', module: 'bug' },
  { code: 'bug.create', title: 'Create Bug', description: 'Create new bug reports', module: 'bug' },
  { code: 'bug.assign', title: 'Assign Bug', description: 'Assign bugs to developers', module: 'bug' },
  { code: 'bug.resolve', title: 'Resolve Bug', description: 'Mark bugs as resolved', module: 'bug' },
  { code: 'bug.close', title: 'Close Bug', description: 'Close bug reports', module: 'bug' },

  // Users module (4)
  { code: 'user.view', title: 'View User', description: 'View user profiles and list users', module: 'user' },
  { code: 'user.create', title: 'Create User', description: 'Create new user accounts', module: 'user' },
  { code: 'user.update', title: 'Update User', description: 'Edit user account information', module: 'user' },
  { code: 'user.delete', title: 'Delete User', description: 'Remove user accounts', module: 'user' },

  // Roles module (2)
  { code: 'role.view', title: 'View Role', description: 'View role details and list roles', module: 'role' },
  { code: 'role.update', title: 'Update Role', description: 'Modify role permissions', module: 'role' },

  // Profile module (2)
  { code: 'profile.view', title: 'View Profile', description: 'View own user profile', module: 'profile' },
  { code: 'profile.update', title: 'Update Profile', description: 'Edit own user profile', module: 'profile' },

  // Notifications module (2)
  { code: 'notification.view', title: 'View Notifications', description: 'View notification list', module: 'notification' },
  { code: 'notification.read', title: 'Read Notification', description: 'Mark notifications as read', module: 'notification' },

  // Activity module (1)
  { code: 'activity.view', title: 'View Activity', description: 'View activity logs', module: 'activity' },
] as const;

function permissionCodes(...codes: string[]): string[] {
  return codes;
}

const ROLE_PERMISSIONS: Record<string, string[]> = {
  Manager: permissionCodes(
    // All permissions
    ...PERMISSIONS.map(p => p.code)
  ),
  Tester: permissionCodes(
    // Project - view only
    'project.view',
    // Test Case - view, create, update (not delete)
    'testcase.view',
    'testcase.create',
    'testcase.update',
    // Test Run - view, create, execute
    'testrun.view',
    'testrun.create',
    'testrun.execute',
    // Execution - view, update
    'execution.view',
    'execution.update',
    // Bug - view, create, close (not assign, not resolve)
    'bug.view',
    'bug.create',
    'bug.close',
    // Profile - own
    'profile.view',
    'profile.update',
    // Notifications
    'notification.view',
    'notification.read',
    // Activity
    'activity.view'
  ),
  Developer: permissionCodes(
    // Project - view only
    'project.view',
    // Test Case - view only
    'testcase.view',
    // Test Run - view only
    'testrun.view',
    // Execution - view only
    'execution.view',
    // Bug - view, resolve (not create, assign, close)
    'bug.view',
    'bug.resolve',
    // Profile - own
    'profile.view',
    'profile.update',
    // Notifications
    'notification.view',
    'notification.read'
  ),
};

async function main() {
  console.log('🚀 Starting permission seeder...\n');

  const result = await prisma.$transaction(async (tx) => {
    // Seed permissions
    console.log('📦 Seeding permissions...');
    let createdCount = 0;
    let skippedCount = 0;

    for (const perm of PERMISSIONS) {
      const existing = await tx.permission.findUnique({
        where: { code: perm.code },
      });
      if (!existing) {
        await tx.permission.create({ data: perm });
        createdCount++;
      } else {
        skippedCount++;
      }
    }

    console.log(`   ✅ Created: ${createdCount}, Skipped: ${skippedCount}`);

    const allPermissions = await tx.permission.findMany();
    const permissionMap = new Map(allPermissions.map(p => [p.code, p.id]));

    // Seed role-permission assignments
    console.log('\n📦 Assigning permissions to roles...');

    for (const [roleName, codes] of Object.entries(ROLE_PERMISSIONS)) {
      const role = await tx.role.findUnique({ where: { name: roleName } });
      if (!role) {
        console.log(`   ⚠️  Role "${roleName}" not found. Skipping.`);
        continue;
      }

      let assignedCount = 0;
      let alreadyAssignedCount = 0;

      for (const code of codes) {
        const permissionId = permissionMap.get(code);
        if (!permissionId) {
          console.log(`   Permission "${code}" not found. Skipping.`);
          continue;
        }

        const existing = await tx.rolePermission.findUnique({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId,
            },
          },
        });

        if (!existing) {
          await tx.rolePermission.create({
            data: {
              roleId: role.id,
              permissionId,
            },
          });
          assignedCount++;
        } else {
          alreadyAssignedCount++;
        }
      }

      console.log(`   👤 ${roleName}: Assigned ${assignedCount}, Already existed ${alreadyAssignedCount}`);
    }

    return { allPermissions };
  });

  // Summary
  console.log('\n📋 Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  for (const [roleName, codes] of Object.entries(ROLE_PERMISSIONS)) {
    console.log(`\n${roleName}:`);
    for (const code of codes) {
      const perm = PERMISSIONS.find(p => p.code === code);
      console.log(`  ✅ ${code} — ${perm?.title}`);
    }
  }
}

main()
  .catch((e) => {
    console.error('\n❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });