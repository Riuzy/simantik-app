import { PrismaClient } from '@prisma/client';
import { ALL_PERMISSIONS } from './PermissionSeeder';
import { ROLES } from './RoleSeeder';

const ROLE_PERMISSION_MAP: Record<string, string[]> = {
  Manager: ALL_PERMISSIONS.map(p => p.code),
  Developer: [
    'dashboard.view',
    'project.view',
    'test-case.view',
    'test-step.view',
    'bug-report.view', 'bug-report.create', 'bug-report.update', 'bug-report.assign', 'bug-report.resolve', 'bug-report.close', 'bug-report.reopen',
    'bug-comment.view', 'bug-comment.create',
    'bug-attachment.view', 'bug-attachment.create',
    'bug-history.view',
    'notification.view', 'notification.read',
    'activity-log.view',
    'profile.view', 'profile.update',
  ],
  Tester: [
    'dashboard.view',
    'project.view',
    'test-case.view', 'test-case.create', 'test-case.update',
    'test-step.view', 'test-step.create', 'test-step.update',
    'test-run.view', 'test-run.create', 'test-run.update', 'test-run.start', 'test-run.finish',
    'execution.view', 'execution.create', 'execution.update',
    'execution-result.view', 'execution-result.update',
    'bug-report.view', 'bug-report.create', 'bug-report.update',
    'bug-comment.view', 'bug-comment.create',
    'bug-attachment.view', 'bug-attachment.create',
    'bug-history.view',
    'notification.view', 'notification.read',
    'activity-log.view',
    'profile.view', 'profile.update',
  ],
};

export async function RolePermissionSeeder(prisma: PrismaClient): Promise<void> {
  const allPerms = await prisma.permission.findMany();
  const permMap = new Map(allPerms.map(p => [p.code, p.id]));

  let totalAssigned = 0, totalSkipped = 0;

  for (const roleName of Object.keys(ROLE_PERMISSION_MAP)) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) { console.warn(`  ${roleName}: role not found`); continue; }

    const codes = ROLE_PERMISSION_MAP[roleName];
    let assigned = 0, skipped = 0;

    for (const code of codes) {
      const permId = permMap.get(code);
      if (!permId) { console.warn(`  ${roleName}: permission "${code}" not found`); continue; }

      const existing = await prisma.rolePermission.findUnique({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permId } },
      });
      if (existing) { skipped++; continue; }

      await prisma.rolePermission.create({ data: { roleId: role.id, permissionId: permId } });
      assigned++;
    }

    totalAssigned += assigned;
    totalSkipped += skipped;
    console.log(`  ${roleName}: ${assigned} assigned, ${skipped} already exist`);
  }

  console.log(`Role permissions: ${totalAssigned} created, ${totalSkipped} skipped`);
}
