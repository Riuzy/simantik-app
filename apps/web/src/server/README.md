# SIMANTIK Backend Architecture

## Overview

Scalable, modular backend architecture following clean architecture principles.

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express
- **ORM**: Prisma
- **Authentication**: JWT
- **Validation**: Zod
- **Logging**: Pino

## Project Structure

```
src/server/
├── config/                 # Application configuration
│   └── index.ts           # Environment variables, app config
├── lib/                   # Shared libraries
│   └── prisma.ts         # Prisma client instance
├── middlewares/           # Express middlewares
│   ├── auth.ts           # Authentication & authorization
│   ├── error-handler.ts  # Global error handling
│   └── validate.ts       # Request validation
├── modules/               # Feature modules
│   └── project/
│       ├── controllers/   # HTTP request handlers
│       ├── services/      # Business logic
│       ├── repositories/  # Data access layer
│       ├── validators/    # Request validation schemas
│       ├── routes/        # Route definitions
│       └── types/         # TypeScript types & DTOs
├── routes/                # Global route setup
│   └── index.ts
├── utils/                 # Utility functions
└── index.ts              # Application entry point
```

## Architecture Layers

### 1. **Controller Layer**
**Responsibility**: HTTP request/response handling

- Receives HTTP requests
- Extracts data from request (body, params, query)
- Calls service layer
- Formats and sends HTTP responses
- Handles HTTP status codes
- **NO business logic**
- **NO database access**

**Example**:
```typescript
create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const project = await this.projectService.create(req.body, req.user.id);
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};
```

### 2. **Service Layer**
**Responsibility**: Business logic

- Contains all business rules
- Orchestrates multiple repositories
- Validates business constraints
- Handles transactions
- Implements domain logic
- **NO HTTP concerns**
- **NO direct Prisma access**

**Example**:
```typescript
async create(dto: CreateProjectDTO, createdById: string) {
  // Business rule: Check for duplicate code
  const existingByCode = await this.repository.findByCode(dto.code);
  if (existingByCode) {
    throw new AppError(409, 'Project with this code already exists');
  }

  return await this.repository.create({ ...dto, createdById });
}
```

### 3. **Repository Layer**
**Responsibility**: Data access

- Direct Prisma communication
- CRUD operations
- Query building
- Data mapping
- **NO business logic**
- **NO HTTP concerns**

**Example**:
```typescript
async create(data: any) {
  return this.prisma.project.create({
    data,
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}
```

### 4. **Validator Layer**
**Responsibility**: Request validation

- Zod schemas for request validation
- Type-safe validation
- Auto-generates TypeScript types
- Validates body, params, query

**Example**:
```typescript
export const createProjectSchema = z.object({
  body: z.object({
    code: z.string().min(2).max(50),
    name: z.string().min(2).max(255),
    slug: z.string().regex(/^[a-z0-9-]+$/),
  }),
});
```

### 5. **Routes Layer**
**Responsibility**: Route definition & dependency injection

- Defines API endpoints
- Wires up controllers, services, repositories
- Applies middlewares (auth, validation)
- Implements dependency injection

**Example**:
```typescript
const projectRepository = new ProjectRepository(prisma);
const projectService = new ProjectService(projectRepository);
const projectController = new ProjectController(projectService);

projectRouter.post(
  '/',
  requireAuth,
  requireRole('Manager'),
  validate(createProjectSchema),
  projectController.create
);
```

## Request Flow

```
HTTP Request
    ↓
Middleware (Auth, Validation)
    ↓
Router
    ↓
Controller (extracts data, calls service)
    ↓
Service (business logic, orchestration)
    ↓
Repository (data access)
    ↓
Prisma
    ↓
Database
```

## Dependency Injection

Each module uses constructor-based dependency injection:

```typescript
// Repository depends on Prisma
class ProjectRepository {
  constructor(private prisma: PrismaClient) {}
}

// Service depends on Repository
class ProjectService {
  constructor(private repository: ProjectRepository) {}
}

// Controller depends on Service
class ProjectController {
  constructor(private projectService: ProjectService) {}
}

// Wire everything in routes
const projectRepository = new ProjectRepository(prisma);
const projectService = new ProjectService(projectRepository);
const projectController = new ProjectController(projectService);
```

**Benefits**:
- Testable (easy to mock dependencies)
- Loosely coupled
- Single Responsibility Principle
- Easy to swap implementations

## Error Handling

### AppError Class
```typescript
throw new AppError(404, 'Project not found');
throw new AppError(409, 'Duplicate project code');
```

### Global Error Handler
Catches all errors and formats responses:
- `AppError` → Custom status codes
- `ZodError` → 400 with validation details
- Unknown errors → 500 with generic message

## Authentication & Authorization

### Authentication Middleware
```typescript
app.use(authMiddleware); // Attaches req.user if valid JWT
```

### Authorization Guards
```typescript
requireAuth // Requires authenticated user
requireRole('Manager', 'Tester') // Requires specific role
```

## Validation

Zod schemas validate:
- Request body
- Query parameters
- URL parameters

Auto-rejects invalid requests with 400 status.

## Module Structure Example

```
modules/project/
├── controllers/
│   └── project.controller.ts    # HTTP handlers
├── services/
│   └── project.service.ts       # Business logic
├── repositories/
│   └── project.repository.ts    # Data access
├── validators/
│   └── project.validators.ts    # Zod schemas
├── routes/
│   └── index.ts                 # Route definitions + DI
└── types/
    └── project.dto.ts           # DTOs and interfaces
```

## Key Principles

### 1. Separation of Concerns
Each layer has a single, well-defined responsibility.

### 2. Dependency Inversion
High-level modules (services) depend on abstractions (repositories), not concrete implementations.

### 3. Single Responsibility
Each class has one reason to change.

### 4. Don't Repeat Yourself (DRY)
Shared logic goes into services, utilities, or middlewares.

### 5. Fail Fast
Validate at the edge (routes/controllers), fail early.

### 6. Type Safety
TypeScript + Zod ensures end-to-end type safety.

## Adding a New Module

1. Create module folder: `modules/<module-name>/`
2. Create subfolders: `controllers/`, `services/`, `repositories/`, `validators/`, `routes/`, `types/`
3. Define DTOs in `types/`
4. Define Zod schemas in `validators/`
5. Implement repository (data access)
6. Implement service (business logic)
7. Implement controller (HTTP handlers)
8. Wire up in `routes/` with DI
9. Register routes in `routes/index.ts`

## Example API Endpoints (Project Module)

```
POST   /api/projects           Create project (Manager only)
GET    /api/projects           List projects (authenticated)
GET    /api/projects/:id       Get project (authenticated)
PUT    /api/projects/:id       Update project (Manager only)
DELETE /api/projects/:id       Delete project (Manager only)
```

## Testing Strategy

### Unit Tests
- Test services with mocked repositories
- Test repositories with mocked Prisma
- Test controllers with mocked services

### Integration Tests
- Test full request flow
- Use test database
- Test authentication & authorization

### Example (Service Test)
```typescript
const mockRepository = {
  findByCode: jest.fn(),
  create: jest.fn(),
};

const service = new ProjectService(mockRepository);

test('should throw error if code exists', async () => {
  mockRepository.findByCode.mockResolvedValue({ id: '1' });
  
  await expect(service.create({...}, 'user-id'))
    .rejects
    .toThrow('Project with this code already exists');
});
```

## Environment Variables

```env
PORT=3001
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=mysql://root:password@localhost:3306/simantik_database
```

## Summary

This architecture provides:

✅ **Scalability** - Easy to add new modules
✅ **Maintainability** - Clear separation of concerns
✅ **Testability** - Dependency injection enables mocking
✅ **Type Safety** - TypeScript + Zod end-to-end
✅ **Security** - JWT auth + role-based access control
✅ **Consistency** - Standardized structure across modules
✅ **Clean Code** - Follows SOLID principles