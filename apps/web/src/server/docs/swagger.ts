import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'SIMANTIK API',
    version: process.env.APP_VERSION || '1.0.0',
    description: 'Software Testing Management System API',
    contact: {
      name: 'SIMANTIK Team',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'API Base URL',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error message' },
          errors: { type: 'array', items: { type: 'object' } },
          timestamp: { type: 'string', format: 'date-time' },
          path: { type: 'string', example: '/api/resource' },
        },
      },
      ValidationError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' },
                code: { type: 'string' },
              },
            },
          },
          timestamp: { type: 'string', format: 'date-time' },
          path: { type: 'string' },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 20 },
          total: { type: 'integer', example: 100 },
          totalPages: { type: 'integer', example: 5 },
          hasNextPage: { type: 'boolean', example: true },
          hasPreviousPage: { type: 'boolean', example: false },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          avatar: { type: 'string', nullable: true },
          phoneNumber: { type: 'string', nullable: true },
          jobTitle: { type: 'string', nullable: true },
          bio: { type: 'string', nullable: true },
          isActive: { type: 'boolean' },
          mustChangePassword: { type: 'boolean' },
          lastLoginAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          role: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
            },
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          password: { type: 'string', format: 'password', example: 'Password123' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Success' },
          data: {
            type: 'object',
            properties: {
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
              mustChangePassword: { type: 'boolean' },
              user: { $ref: '#/components/schemas/User' },
            },
          },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      RefreshTokenRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
      },
      CreateUserRequest: {
        type: 'object',
        required: ['name', 'email', 'roleId', 'temporaryPassword'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 255 },
          email: { type: 'string', format: 'email', maxLength: 255 },
          roleId: { type: 'string', format: 'uuid' },
          temporaryPassword: { type: 'string', format: 'password', minLength: 8 },
          phoneNumber: { type: 'string', maxLength: 20 },
          jobTitle: { type: 'string', maxLength: 100 },
          avatar: { type: 'string', format: 'uri' },
        },
      },
      UpdateUserRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 255 },
          phoneNumber: { type: 'string', maxLength: 20 },
          jobTitle: { type: 'string', maxLength: 100 },
          bio: { type: 'string', maxLength: 500 },
          isActive: { type: 'boolean' },
          roleId: { type: 'string', format: 'uuid' },
        },
      },
      ChangePasswordRequest: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string', format: 'password' },
          newPassword: { type: 'string', format: 'password', minLength: 8 },
        },
      },
      Project: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          code: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['ACTIVE', 'COMPLETED'] },
          startDate: { type: 'string', format: 'date-time', nullable: true },
          endDate: { type: 'string', format: 'date-time', nullable: true },
          createdById: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          createdBy: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
            },
          },
        },
      },
      TestCase: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          code: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          precondition: { type: 'string', nullable: true },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
          status: { type: 'string', enum: ['DRAFT', 'READY', 'OBSOLETE'] },
          projectId: { type: 'string', format: 'uuid' },
          createdById: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      TestRun: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          code: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          projectId: { type: 'string', format: 'uuid' },
          executedById: { type: 'string', format: 'uuid' },
          status: { type: 'string', enum: ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] },
          startedAt: { type: 'string', format: 'date-time', nullable: true },
          completedAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Execution: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          testRunId: { type: 'string', format: 'uuid' },
          testCaseId: { type: 'string', format: 'uuid' },
          testerId: { type: 'string', format: 'uuid' },
          status: { type: 'string', enum: ['NOT_RUN', 'PASSED', 'FAILED', 'BLOCKED', 'SKIPPED'] },
          executedAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      BugReport: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          code: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          severity: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'BLOCKER'] },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
          status: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'READY_FOR_RETEST', 'RESOLVED', 'CLOSED', 'REJECTED'] },
          executionId: { type: 'string', format: 'uuid' },
          projectId: { type: 'string', format: 'uuid' },
          reportedById: { type: 'string', format: 'uuid' },
          assignedToId: { type: 'string', format: 'uuid', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          message: { type: 'string' },
          type: { type: 'string', enum: ['INFO', 'SUCCESS', 'WARNING', 'ERROR'] },
          isRead: { type: 'boolean' },
          readAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      ActivityLog: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          action: { type: 'string' },
          entity: { type: 'string' },
          entityId: { type: 'string', format: 'uuid' },
          description: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
            },
          },
        },
      },
    },
  },
  paths: {
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login',
        description: 'Authenticate user with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' },
              },
            },
          },
          '401': {
            description: 'Invalid credentials',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Logout',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Logged out successfully' } },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Authentication'],
        summary: 'Refresh access token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshTokenRequest' },
            },
          },
        },
        responses: {
          '200': { description: 'Token refreshed successfully' },
          '401': { description: 'Invalid refresh token' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current user',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Current user info' },
          '401': { description: 'Authentication required' },
        },
      },
    },
    '/auth/change-password': {
      patch: {
        tags: ['Authentication'],
        summary: 'Change password',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ChangePasswordRequest' },
            },
          },
        },
        responses: {
          '200': { description: 'Password changed successfully' },
          '401': { description: 'Current password is incorrect' },
        },
      },
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'List users',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'roleId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'isActive', in: 'query', schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'List of users' }, '401': { description: 'Unauthorized' } },
      },
      post: {
        tags: ['Users'],
        summary: 'Create user (Manager only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateUserRequest' } } },
        },
        responses: { '201': { description: 'User created' }, '403': { description: 'Forbidden' } },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'User found' }, '404': { description: 'User not found' } },
      },
      put: {
        tags: ['Users'],
        summary: 'Update user (Manager only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateUserRequest' } } },
        },
        responses: { '200': { description: 'User updated' } },
      },
      delete: {
        tags: ['Users'],
        summary: 'Soft delete user (Manager only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '204': { description: 'User deleted' } },
      },
    },
    '/users/{id}/reset-password': {
      patch: {
        tags: ['Users'],
        summary: 'Reset password (Manager only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Password reset' } },
      },
    },
    '/users/{id}/activate': {
      patch: {
        tags: ['Users'],
        summary: 'Activate user (Manager only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'User activated' } },
      },
    },
    '/users/{id}/deactivate': {
      patch: {
        tags: ['Users'],
        summary: 'Deactivate user (Manager only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'User deactivated' } },
      },
    },
    '/users/{id}/change-role': {
      patch: {
        tags: ['Users'],
        summary: 'Change user role (Manager only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Role changed' } },
      },
    },
    '/users/roles': {
      get: {
        tags: ['Users'],
        summary: 'Get all roles',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'List of roles' } },
      },
    },
    '/projects': {
      get: {
        tags: ['Projects'],
        summary: 'List projects',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'List of projects' } },
      },
      post: {
        tags: ['Projects'],
        summary: 'Create project (Manager only)',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Project created' } },
      },
    },
    '/projects/{id}': {
      get: {
        tags: ['Projects'],
        summary: 'Get project by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Project found' } },
      },
      patch: {
        tags: ['Projects'],
        summary: 'Update project (Manager only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Project updated' } },
      },
      delete: {
        tags: ['Projects'],
        summary: 'Delete project (Manager only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '204': { description: 'Project deleted' } },
      },
    },
    '/projects/{id}/members': {
      get: {
        tags: ['Projects'],
        summary: 'List project members',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'List of members' } },
      },
      post: {
        tags: ['Projects'],
        summary: 'Add member to project',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '201': { description: 'Member added' } },
      },
    },
    '/projects/{id}/members/{userId}': {
      delete: {
        tags: ['Projects'],
        summary: 'Remove member from project',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'userId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: { '204': { description: 'Member removed' } },
      },
    },
    '/test-cases': {
      get: {
        tags: ['Test Cases'],
        summary: 'List test cases',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'projectId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'priority', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'List of test cases' } },
      },
      post: {
        tags: ['Test Cases'],
        summary: 'Create test case (Manager, Tester)',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Test case created' } },
      },
    },
    '/test-cases/{id}': {
      get: {
        tags: ['Test Cases'],
        summary: 'Get test case by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Test case found' } },
      },
      patch: {
        tags: ['Test Cases'],
        summary: 'Update test case (Manager, Tester)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Test case updated' } },
      },
      delete: {
        tags: ['Test Cases'],
        summary: 'Delete test case (Manager, Tester)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '204': { description: 'Test case deleted' } },
      },
    },
    '/test-cases/{id}/duplicate': {
      post: {
        tags: ['Test Cases'],
        summary: 'Duplicate test case',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '201': { description: 'Test case duplicated' } },
      },
    },
    '/test-cases/{id}/clone': {
      post: {
        tags: ['Test Cases'],
        summary: 'Clone test case to another project',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '201': { description: 'Test case cloned' } },
      },
    },
    '/test-runs': {
      get: {
        tags: ['Test Runs'],
        summary: 'List test runs',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'projectId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'List of test runs' } },
      },
      post: {
        tags: ['Test Runs'],
        summary: 'Create test run (Manager, Tester)',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Test run created' } },
      },
    },
    '/test-runs/{id}': {
      get: {
        tags: ['Test Runs'],
        summary: 'Get test run by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Test run found' } },
      },
      patch: {
        tags: ['Test Runs'],
        summary: 'Update test run',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Test run updated' } },
      },
      delete: {
        tags: ['Test Runs'],
        summary: 'Delete test run',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '204': { description: 'Test run deleted' } },
      },
    },
    '/test-runs/{id}/start': {
      post: {
        tags: ['Test Runs'],
        summary: 'Start test run',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Test run started' } },
      },
    },
    '/test-runs/{id}/finish': {
      post: {
        tags: ['Test Runs'],
        summary: 'Finish test run',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Test run finished' } },
      },
    },
    '/test-runs/{id}/statistics': {
      get: {
        tags: ['Test Runs'],
        summary: 'Get test run statistics',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Test run statistics' } },
      },
    },
    '/bugs': {
      get: {
        tags: ['Bug Reports'],
        summary: 'List bugs',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'projectId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'severity', in: 'query', schema: { type: 'string' } },
          { name: 'priority', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'List of bugs' } },
      },
      post: {
        tags: ['Bug Reports'],
        summary: 'Create bug report (Manager, Tester)',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Bug report created' } },
      },
    },
    '/bugs/{id}': {
      get: {
        tags: ['Bug Reports'],
        summary: 'Get bug by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Bug found' } },
      },
      patch: {
        tags: ['Bug Reports'],
        summary: 'Update bug',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Bug updated' } },
      },
      delete: {
        tags: ['Bug Reports'],
        summary: 'Delete bug',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '204': { description: 'Bug deleted' } },
      },
    },
    '/bugs/{id}/assign': {
      patch: {
        tags: ['Bug Reports'],
        summary: 'Assign bug to user',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Bug assigned' } },
      },
    },
    '/bugs/{id}/in-progress': {
      patch: {
        tags: ['Bug Reports'],
        summary: 'Set bug to in progress',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Bug in progress' } },
      },
    },
    '/bugs/{id}/resolve': {
      patch: {
        tags: ['Bug Reports'],
        summary: 'Resolve bug',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Bug resolved' } },
      },
    },
    '/bugs/{id}/close': {
      patch: {
        tags: ['Bug Reports'],
        summary: 'Close bug',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Bug closed' } },
      },
    },
    '/bugs/{id}/reopen': {
      patch: {
        tags: ['Bug Reports'],
        summary: 'Reopen bug',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Bug reopened' } },
      },
    },
    '/bugs/{bugId}/comments': {
      get: {
        tags: ['Bug Reports'],
        summary: 'List comments',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'bugId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'List of comments' } },
      },
      post: {
        tags: ['Bug Reports'],
        summary: 'Add comment',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'bugId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '201': { description: 'Comment added' } },
      },
    },
    '/bugs/{bugId}/comments/{commentId}': {
      delete: {
        tags: ['Bug Reports'],
        summary: 'Delete comment',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'bugId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'commentId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: { '204': { description: 'Comment deleted' } },
      },
    },
    '/bugs/{bugId}/attachments': {
      get: {
        tags: ['Bug Reports'],
        summary: 'List attachments',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'bugId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'List of attachments' } },
      },
      post: {
        tags: ['Bug Reports'],
        summary: 'Add attachment',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'bugId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '201': { description: 'Attachment added' } },
      },
    },
    '/bugs/{bugId}/attachments/{attachmentId}': {
      delete: {
        tags: ['Bug Reports'],
        summary: 'Delete attachment',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'bugId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'attachmentId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: { '204': { description: 'Attachment deleted' } },
      },
    },
    '/bugs/{bugId}/history': {
      get: {
        tags: ['Bug Reports'],
        summary: 'List bug history',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'bugId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'List of history' } },
      },
    },
    '/bugs/statistics': {
      get: {
        tags: ['Bug Reports'],
        summary: 'Get bug statistics',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Bug statistics' } },
      },
    },
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'List notifications',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'type', in: 'query', schema: { type: 'string' } },
          { name: 'isRead', in: 'query', schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'List of notifications' } },
      },
    },
    '/notifications/unread-count': {
      get: {
        tags: ['Notifications'],
        summary: 'Get unread notification count',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Unread count' } },
      },
    },
    '/notifications/{id}': {
      get: {
        tags: ['Notifications'],
        summary: 'Get notification by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Notification found' } },
      },
      delete: {
        tags: ['Notifications'],
        summary: 'Delete notification',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '204': { description: 'Notification deleted' } },
      },
    },
    '/notifications/mark-read': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark notifications as read',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Notifications marked as read' } },
      },
    },
    '/notifications/mark-all-read': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark all notifications as read',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'All notifications marked as read' } },
      },
    },
    '/activity-logs': {
      get: {
        tags: ['Activity Logs'],
        summary: 'List activity logs',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'entity', in: 'query', schema: { type: 'string' } },
          { name: 'action', in: 'query', schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'List of activity logs' } },
      },
    },
    '/activity-logs/{entity}/{id}': {
      get: {
        tags: ['Activity Logs'],
        summary: 'Get entity-specific activity logs',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'entity', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: { '200': { description: 'Entity activity logs' } },
      },
    },
    '/health': {
      get: {
        tags: ['Monitoring'],
        summary: 'Health check',
        responses: { '200': { description: 'Server is healthy' } },
      },
    },
    '/ready': {
      get: {
        tags: ['Monitoring'],
        summary: 'Readiness check',
        responses: { '200': { description: 'Server is ready' } },
      },
    },
    '/version': {
      get: {
        tags: ['Monitoring'],
        summary: 'Get API version',
        responses: { '200': { description: 'API version' } },
      },
    },
  },
};

export const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: [],
});
