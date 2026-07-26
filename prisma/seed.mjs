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
];

const ROLE_PERMISSIONS = {
  Manager: PERMISSIONS.map(p => p.code),
  Tester: [
    'project.view',
    'testcase.view',
    'testcase.create',
    'testcase.update',
    'testrun.view',
    'testrun.create',
    'testrun.execute',
    'execution.view',
    'execution.update',
    'bug.view',
    'bug.create',
    'bug.close',
    'profile.view',
    'profile.update',
    'notification.view',
    'notification.read',
    'activity.view'
  ],
  Developer: [
    'project.view',
    'testcase.view',
    'testrun.view',
    'execution.view',
    'bug.view',
    'bug.resolve',
    'profile.view',
    'profile.update',
    'notification.view',
    'notification.read'
  ],
};

async function main() {
  console.log('🚀 Starting permission seeder...\n');

  console.log('📦 Seeding permissions...');
  let createdCount = 0;
  let skippedCount = 0;

  for (const perm of PERMISSIONS) {
    const existing = await prisma.permission.findUnique({
      where: { code: perm.code },
    });
    if (!existing) {
      await prisma.permission.create({ data: perm });
      createdCount++;
    } else {
      skippedCount++;
    }
  }

  console.log(`   ✅ Created: ${createdCount}, Skipped: ${skippedCount}`);

  const allPermissions = await prisma.permission.findMany();
  const permissionMap = new Map(allPermissions.map(p => [p.code, p.id]));

  console.log('\n📦 Assigning permissions to roles...');

  for (const [roleName, codes] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      console.log(`   ⚠️  Role "${roleName}" not found. Skipping.`);
      continue;
    }

    let assignedCount = 0;
    let alreadyAssignedCount = 0;

    for (const code of codes) {
      const permissionId = permissionMap.get(code);
      if (!permissionId) {
        console.log(`   ⚠️  Permission "${code}" not found. Skipping.`);
        continue;
      }

      const existing = await prisma.rolePermission.findUnique({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId,
          },
        },
      });

      if (!existing) {
        await prisma.rolePermission.create({
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

  console.log('\n📋 Permission Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\nManager: ${ROLE_PERMISSIONS.Manager.length} permissions (ALL)`);
  console.log(`Tester: ${ROLE_PERMISSIONS.Tester.length} permissions`);
  console.log(`Developer: ${ROLE_PERMISSIONS.Developer.length} permissions`);
}

main()
  .catch((e) => {
    console.error('\n❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });