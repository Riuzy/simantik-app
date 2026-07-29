import { PrismaClient } from '@prisma/client';

export interface PermissionSeed {
  code: string;
  title: string;
  description: string;
  module: string;
}

export const ALL_PERMISSIONS: PermissionSeed[] = [
  { code: 'dashboard.view', title: 'View Dashboard', description: 'View the main dashboard', module: 'Dashboard' },
  { code: 'project.view', title: 'View Project', description: 'View project details and list projects', module: 'Project' },
  { code: 'project.create', title: 'Create Project', description: 'Create new projects', module: 'Project' },
  { code: 'project.update', title: 'Update Project', description: 'Edit existing projects', module: 'Project' },
  { code: 'project.delete', title: 'Delete Project', description: 'Delete projects', module: 'Project' },
  { code: 'project-member.view', title: 'View Project Members', description: 'View project member list', module: 'Project Member' },
  { code: 'project-member.add', title: 'Add Project Member', description: 'Add members to project', module: 'Project Member' },
  { code: 'project-member.remove', title: 'Remove Project Member', description: 'Remove members from project', module: 'Project Member' },
  { code: 'test-case.view', title: 'View Test Case', description: 'View test case details and list', module: 'Test Case' },
  { code: 'test-case.create', title: 'Create Test Case', description: 'Create new test cases', module: 'Test Case' },
  { code: 'test-case.update', title: 'Update Test Case', description: 'Edit test cases', module: 'Test Case' },
  { code: 'test-case.delete', title: 'Delete Test Case', description: 'Delete test cases', module: 'Test Case' },
  { code: 'test-step.view', title: 'View Test Steps', description: 'View test case steps', module: 'Test Step' },
  { code: 'test-step.create', title: 'Create Test Step', description: 'Add steps to test cases', module: 'Test Step' },
  { code: 'test-step.update', title: 'Update Test Step', description: 'Edit test steps', module: 'Test Step' },
  { code: 'test-step.delete', title: 'Delete Test Step', description: 'Remove test steps', module: 'Test Step' },
  { code: 'test-run.view', title: 'View Test Run', description: 'View test run details and list', module: 'Test Run' },
  { code: 'test-run.create', title: 'Create Test Run', description: 'Create new test runs', module: 'Test Run' },
  { code: 'test-run.update', title: 'Update Test Run', description: 'Edit test runs', module: 'Test Run' },
  { code: 'test-run.delete', title: 'Delete Test Run', description: 'Delete test runs', module: 'Test Run' },
  { code: 'test-run.start', title: 'Start Test Run', description: 'Start a test run execution', module: 'Test Run' },
  { code: 'test-run.finish', title: 'Finish Test Run', description: 'Finish a test run', module: 'Test Run' },
  { code: 'execution.view', title: 'View Execution', description: 'View execution details and list', module: 'Execution' },
  { code: 'execution.create', title: 'Create Execution', description: 'Create new execution', module: 'Execution' },
  { code: 'execution.update', title: 'Update Execution', description: 'Update execution status and results', module: 'Execution' },
  { code: 'execution-result.view', title: 'View Execution Result', description: 'View test execution results', module: 'Execution Result' },
  { code: 'execution-result.update', title: 'Update Execution Result', description: 'Update test execution results', module: 'Execution Result' },
  { code: 'bug-report.view', title: 'View Bug Report', description: 'View bug report details and list', module: 'Bug Report' },
  { code: 'bug-report.create', title: 'Create Bug Report', description: 'Create new bug reports', module: 'Bug Report' },
  { code: 'bug-report.update', title: 'Update Bug Report', description: 'Edit bug reports', module: 'Bug Report' },
  { code: 'bug-report.delete', title: 'Delete Bug Report', description: 'Delete bug reports', module: 'Bug Report' },
  { code: 'bug-report.assign', title: 'Assign Bug Report', description: 'Assign bugs to users', module: 'Bug Report' },
  { code: 'bug-report.resolve', title: 'Resolve Bug Report', description: 'Mark bugs as resolved', module: 'Bug Report' },
  { code: 'bug-report.close', title: 'Close Bug Report', description: 'Close bug reports', module: 'Bug Report' },
  { code: 'bug-report.reopen', title: 'Reopen Bug Report', description: 'Reopen closed bug reports', module: 'Bug Report' },
  { code: 'bug-comment.view', title: 'View Bug Comments', description: 'View comments on bug reports', module: 'Bug Comment' },
  { code: 'bug-comment.create', title: 'Create Bug Comment', description: 'Add comments to bug reports', module: 'Bug Comment' },
  { code: 'bug-comment.delete', title: 'Delete Bug Comment', description: 'Delete bug comments', module: 'Bug Comment' },
  { code: 'bug-attachment.view', title: 'View Attachments', description: 'View bug report attachments', module: 'Bug Attachment' },
  { code: 'bug-attachment.create', title: 'Create Attachment', description: 'Upload attachments to bugs', module: 'Bug Attachment' },
  { code: 'bug-attachment.delete', title: 'Delete Attachment', description: 'Delete bug attachments', module: 'Bug Attachment' },
  { code: 'bug-history.view', title: 'View Bug History', description: 'View bug report change history', module: 'Bug History' },
  { code: 'notification.view', title: 'View Notifications', description: 'View notification list', module: 'Notification' },
  { code: 'notification.read', title: 'Read Notification', description: 'Mark notifications as read', module: 'Notification' },
  { code: 'activity-log.view', title: 'View Activity Log', description: 'View system activity logs', module: 'Activity Log' },
  { code: 'uploaded-file.view', title: 'View Uploaded Files', description: 'View uploaded file list', module: 'Uploaded File' },
  { code: 'uploaded-file.create', title: 'Upload File', description: 'Upload new files', module: 'Uploaded File' },
  { code: 'uploaded-file.delete', title: 'Delete Uploaded File', description: 'Delete uploaded files', module: 'Uploaded File' },
  { code: 'profile.view', title: 'View Profile', description: 'View own user profile', module: 'Profile' },
  { code: 'profile.update', title: 'Update Profile', description: 'Edit own user profile', module: 'Profile' },
  { code: 'role.view', title: 'View Roles', description: 'View role list and details', module: 'Role' },
  { code: 'role.update', title: 'Update Role', description: 'Modify role permissions', module: 'Role' },
  { code: 'permission.view', title: 'View Permissions', description: 'View permission list', module: 'Permission' },
  { code: 'user.view', title: 'View Users', description: 'View user list and details', module: 'User' },
  { code: 'user.create', title: 'Create User', description: 'Create new user accounts', module: 'User' },
  { code: 'user.update', title: 'Update User', description: 'Edit user accounts', module: 'User' },
  { code: 'user.delete', title: 'Delete User', description: 'Delete user accounts', module: 'User' },
];

export async function PermissionSeeder(prisma: PrismaClient): Promise<void> {
  let created = 0, skipped = 0;
  for (const perm of ALL_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: { title: perm.title, description: perm.description, module: perm.module },
      create: { code: perm.code, title: perm.title, description: perm.description, module: perm.module },
    });
    const existing = await prisma.permission.findUnique({ where: { code: perm.code } });
    if (existing && existing.title === perm.title) skipped++;
    else created++;
  }
  console.log(`Permissions: ${ALL_PERMISSIONS.length} total, ${created} created, ${skipped} skipped`);
}
