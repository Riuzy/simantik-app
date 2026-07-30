export enum UserRole {
  MANAGER = 'Manager',
  DEVELOPER = 'Developer',
  TESTER = 'Tester',
}

export enum Permission {
  // User Management
  USERS_CREATE = 'users:create',
  USERS_READ = 'users:read',
  USERS_UPDATE = 'users:update',
  USERS_DELETE = 'users:delete',
  USERS_RESET_PASSWORD = 'users:reset-password',
  USERS_ACTIVATE = 'users:activate',
  USERS_DEACTIVATE = 'users:deactivate',
  USERS_CHANGE_ROLE = 'users:change-role',

  // Project Management
  PROJECTS_CREATE = 'projects:create',
  PROJECTS_READ = 'projects:read',
  PROJECTS_UPDATE = 'projects:update',
  PROJECTS_DELETE = 'projects:delete',
  PROJECTS_MANAGE_MEMBERS = 'projects:manage-members',

  // Test Cases
  TEST_CASES_CREATE = 'test-cases:create',
  TEST_CASES_READ = 'test-cases:read',
  TEST_CASES_UPDATE = 'test-cases:update',
  TEST_CASES_DELETE = 'test-cases:delete',
  TEST_CASES_DUPLICATE = 'test-cases:duplicate',
  TEST_CASES_CLONE = 'test-cases:clone',
  TEST_CASES_MANAGE_STEPS = 'test-cases:manage-steps',

  // Test Runs
  TEST_RUNS_CREATE = 'test-runs:create',
  TEST_RUNS_READ = 'test-runs:read',
  TEST_RUNS_UPDATE = 'test-runs:update',
  TEST_RUNS_DELETE = 'test-runs:delete',
  TEST_RUNS_START = 'test-runs:start',
  TEST_RUNS_FINISH = 'test-runs:finish',
  TEST_RUNS_EXECUTE = 'test-runs:execute',

  // Executions
  EXECUTIONS_READ = 'executions:read',
  EXECUTIONS_EXECUTE = 'executions:execute',
  EXECUTIONS_UPDATE = 'executions:update',

  // Bug Reports
  BUGS_CREATE = 'bugs:create',
  BUGS_READ = 'bugs:read',
  BUGS_UPDATE = 'bugs:update',
  BUGS_DELETE = 'bugs:delete',
  BUGS_ASSIGN = 'bugs:assign',
  BUGS_RESOLVE = 'bugs:resolve',
  BUGS_CLOSE = 'bugs:close',
  BUGS_REOPEN = 'bugs:reopen',
  BUGS_COMMENT = 'bugs:comment',
  BUGS_ATTACHMENTS = 'bugs:attachments',

  // Notifications
  NOTIFICATIONS_READ = 'notifications:read',
  NOTIFICATIONS_MANAGE = 'notifications:manage',

  // Projects - Members
  PROJECT_MEMBERS_ADD = 'project-members:add',
  PROJECT_MEMBERS_REMOVE = 'project-members:remove',
  PROJECT_MEMBERS_UPDATE = 'project-members:update',
}

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [UserRole.MANAGER]: Object.values(Permission),
  [UserRole.DEVELOPER]: [
    // Projects
    Permission.PROJECTS_READ,
    // Test Cases - Read only
    Permission.TEST_CASES_READ,
    // Test Runs - Read only
    Permission.TEST_RUNS_READ,
    // Executions - Read only
    Permission.EXECUTIONS_READ,
    // Bugs
    Permission.BUGS_CREATE,
    Permission.BUGS_READ,
    Permission.BUGS_UPDATE,
    Permission.BUGS_ASSIGN,
    Permission.BUGS_RESOLVE,
    Permission.BUGS_CLOSE,
    Permission.BUGS_REOPEN,
    Permission.BUGS_COMMENT,
    Permission.BUGS_ATTACHMENTS,
    // Notifications
    Permission.NOTIFICATIONS_READ,
  ],
  [UserRole.TESTER]: [
    // Test Cases - Full CRUD
    Permission.TEST_CASES_CREATE,
    Permission.TEST_CASES_READ,
    Permission.TEST_CASES_UPDATE,
    Permission.TEST_CASES_DELETE,
    Permission.TEST_CASES_DUPLICATE,
    Permission.TEST_CASES_CLONE,
    Permission.TEST_CASES_MANAGE_STEPS,
    // Test Runs - Full CRUD
    Permission.TEST_RUNS_CREATE,
    Permission.TEST_RUNS_READ,
    Permission.TEST_RUNS_UPDATE,
    Permission.TEST_RUNS_DELETE,
    Permission.TEST_RUNS_START,
    Permission.TEST_RUNS_FINISH,
    Permission.TEST_RUNS_EXECUTE,
    // Executions - Full access
    Permission.EXECUTIONS_READ,
    Permission.EXECUTIONS_EXECUTE,
    Permission.EXECUTIONS_UPDATE,
    // Bugs
    Permission.BUGS_CREATE,
    Permission.BUGS_READ,
    Permission.BUGS_UPDATE,
    Permission.BUGS_COMMENT,
    Permission.BUGS_ATTACHMENTS,
    // Notifications
    Permission.NOTIFICATIONS_READ,
  ],
};

export const ROLE_HIERARCHY: Record<string, number> = {
  [UserRole.MANAGER]: 3,
  [UserRole.DEVELOPER]: 2,
  [UserRole.TESTER]: 1,
};

export const NAVIGATION_PERMISSIONS: Record<string, string[]> = {
  '/dashboard': [],
  '/projects': [Permission.PROJECTS_READ],
  '/projects/create': [Permission.PROJECTS_CREATE],
  '/test-cases': [Permission.TEST_CASES_READ],
  '/test-cases/create': [Permission.TEST_CASES_CREATE],
  '/test-runs': [Permission.TEST_RUNS_READ],
  '/test-runs/create': [Permission.TEST_RUNS_CREATE],
  '/executions': [Permission.EXECUTIONS_READ],
  '/bugs': [Permission.BUGS_READ],
  '/bugs/create': [Permission.BUGS_CREATE],
  '/users': [Permission.USERS_READ],
  '/users/create': [Permission.USERS_CREATE],
  '/notifications': [Permission.NOTIFICATIONS_READ],
  '/profile': [],
  '/settings': [],
};