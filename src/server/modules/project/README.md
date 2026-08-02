# Project Module

## Overview

Complete project management system with CRUD operations, member management, and advanced filtering/sorting capabilities.

## Features

✅ **Project CRUD**
- Create project
- Get project by ID
- Update project
- Soft delete project
- List projects with pagination

✅ **Member Management**
- Add member to project
- Remove member from project
- List project members
- Check membership status

✅ **Advanced Filtering**
- Filter by status
- Filter by creator
- Search across name, code, slug, description
- Sort by createdAt, name, updatedAt
- Ascending/Descending order

✅ **Permissions**
- Manager: Full control
- Project Creator: Manage own projects & members
- Project Members: View project details
- Soft delete preserves data

## Architecture

```
Routes → Controller → Service → Repository → Prisma
```

## API Endpoints

### GET /api/projects
List projects with pagination, filters, and sorting

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 20, max: 100) - Items per page
- `status` - Filter by ProjectStatus (PLANNING, ACTIVE, TESTING, COMPLETED, ARCHIVED)
- `search` - Search in name, code, slug, description
- `createdById` - Filter by creator UUID
- `sortBy` (default: createdAt) - Sort field: createdAt, name, updatedAt
- `sortOrder` (default: desc) - Sort order: asc, desc

**Headers:**
```
Authorization: Bearer <access-token>
```

**Example Request:**
```
GET /api/projects?page=1&limit=20&status=ACTIVE&search=test&sortBy=name&sortOrder=asc
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "code": "PRJ-001",
      "name": "SIMANTIK Testing",
      "slug": "simantik-testing",
      "status": "ACTIVE",
      "createdAt": "2026-07-20T10:00:00.000Z",
      "createdBy": {
        "id": "uuid",
        "name": "John Doe"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "timestamp": "2026-07-25T17:00:00.000Z"
}
```

### POST /api/projects
Create new project (Manager only)

**Headers:**
```
Authorization: Bearer <access-token> (Manager)
```

**Request:**
```json
{
  "code": "PRJ-001",
  "name": "SIMANTIK Testing",
  "slug": "simantik-testing",
  "description": "Main testing project for SIMANTIK",
  "status": "PLANNING",
  "startDate": "2026-08-01T00:00:00.000Z",
  "endDate": "2026-12-31T23:59:59.999Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "code": "PRJ-001",
    "name": "SIMANTIK Testing",
    "slug": "simantik-testing",
    "description": "Main testing project for SIMANTIK",
    "status": "PLANNING",
    "startDate": "2026-08-01T00:00:00.000Z",
    "endDate": "2026-12-31T23:59:59.999Z",
    "createdById": "user-uuid",
    "createdAt": "2026-07-25T17:00:00.000Z",
    "updatedAt": "2026-07-25T17:00:00.000Z",
    "createdBy": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com"
    }
  },
  "timestamp": "2026-07-25T17:00:00.000Z"
}
```

### GET /api/projects/:id
Get project by ID with full details

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "code": "PRJ-001",
    "name": "SIMANTIK Testing",
    "slug": "simantik-testing",
    "description": "Main testing project for SIMANTIK",
    "status": "ACTIVE",
    "startDate": "2026-08-01T00:00:00.000Z",
    "endDate": "2026-12-31T23:59:59.999Z",
    "createdById": "user-uuid",
    "createdAt": "2026-07-25T17:00:00.000Z",
    "updatedAt": "2026-07-25T17:00:00.000Z",
    "createdBy": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "members": [
      {
        "id": "member-uuid",
        "userId": "user-uuid-2",
        "projectId": "project-uuid",
        "joinedAt": "2026-07-25T12:00:00.000Z",
        "user": {
          "id": "user-uuid-2",
          "name": "Jane Smith",
          "email": "jane@example.com",
          "avatar": null,
          "jobTitle": "QA Engineer",
          "role": {
            "id": "role-uuid",
            "name": "Tester"
          }
        }
      }
    ],
    "_count": {
      "members": 5,
      "testCases": 25,
      "testRuns": 10,
      "bugReports": 3
    }
  },
  "timestamp": "2026-07-25T17:00:00.000Z"
}
```

### PATCH /api/projects/:id
Update project (Manager only)

**Headers:**
```
Authorization: Bearer <access-token> (Manager)
```

**Request:**
```json
{
  "name": "SIMANTIK Testing Updated",
  "status": "ACTIVE",
  "description": "Updated description"
}
```

**Response:** Updated project object (same structure as GET /:id)

### DELETE /api/projects/:id
Soft delete project (Manager only)

**Headers:**
```
Authorization: Bearer <access-token> (Manager)
```

**Response:** 204 No Content

### POST /api/projects/:id/members
Add member to project

**Headers:**
```
Authorization: Bearer <access-token> (Project Creator or Manager)
```

**Request:**
```json
{
  "userId": "user-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "member-uuid",
    "userId": "user-uuid",
    "projectId": "project-uuid",
    "joinedAt": "2026-07-25T17:05:00.000Z",
    "user": {
      "id": "user-uuid",
      "name": "Bob Johnson",
      "email": "bob@example.com",
      "avatar": null,
      "jobTitle": "Developer",
      "role": {
        "id": "role-uuid",
        "name": "Developer"
      }
    }
  },
  "timestamp": "2026-07-25T17:05:00.000Z"
}
```

### DELETE /api/projects/:id/members/:userId
Remove member from project

**Headers:**
```
Authorization: Bearer <access-token> (Project Creator or Manager)
```

**Response:** 204 No Content

**Note:** Cannot remove project creator

### GET /api/projects/:id/members
List project members

**Headers:**
```
Authorization: Bearer <access-token> (Project Creator, Member, or Manager)
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "member-uuid",
      "userId": "user-uuid",
      "projectId": "project-uuid",
      "joinedAt": "2026-07-25T12:00:00.000Z",
      "user": {
        "id": "user-uuid",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "avatar": null,
        "jobTitle": "QA Engineer",
        "role": {
          "id": "role-uuid",
          "name": "Tester"
        }
      }
    }
  ],
  "timestamp": "2026-07-25T17:00:00.000Z"
}
```

## Access Control

### Project Permissions

| Role | Create | View | Update | Delete | Manage Members |
|------|--------|------|--------|--------|----------------|
| Manager | ✅ | ✅ | ✅ | ✅ | ✅ |
| Project Creator | ❌ | ✅ | ❌ | ❌ | ✅ |
| Project Member | ❌ | ✅ | ❌ | ❌ | ❌ |
| Other Users | ❌ | ✅ | ❌ | ❌ | ❌ |

### Authorization Logic

#### Adding Members
```typescript
// Only project creator or Manager can add members
if (currentUserId !== project.createdById && !isManager) {
  throw new AppError(403, 'Only project creator or Manager can add members');
}
```

#### Removing Members
```typescript
// Cannot remove project creator
if (userId === project.createdById) {
  throw new AppError(400, 'Cannot remove project creator');
}

// Only project creator or Manager can remove members
if (currentUserId !== project.createdById && !isManager) {
  throw new AppError(403, 'Only project creator or Manager can remove members');
}
```

#### Viewing Members
```typescript
// Must be creator, member, or Manager
const isMember = await projectService.isMember(projectId, userId);
if (userId !== project.createdById && !isMember && !isManager) {
  throw new AppError(403, 'Access denied');
}
```

## Validation Rules

### Project Creation
- **code**: 2-50 chars, uppercase letters/numbers/hyphens only, unique
- **name**: 2-255 chars
- **slug**: 2-255 chars, lowercase letters/numbers/hyphens only, unique
- **description**: Max 500 chars (optional)
- **status**: PLANNING, ACTIVE, TESTING, COMPLETED, ARCHIVED (default: PLANNING)
- **startDate**: ISO 8601 datetime (optional)
- **endDate**: ISO 8601 datetime (optional)

### Project Update
- At least one field must be provided
- Slug must be unique if changed
- Same validation rules as creation

### Add Member
- **userId**: Must be valid UUID
- User must exist and be active
- User cannot already be a member
- Project must exist

## Business Logic

### Soft Delete Implementation
```typescript
await this.repository.softDelete(id);
// Sets:
// - deletedAt = current timestamp
// - Preserves all project data and relations
```

### Uniqueness Checks
```typescript
// Code uniqueness
const existingByCode = await repository.findByCode(code);
if (existingByCode) {
  throw new AppError(409, 'Project with this code already exists');
}

// Slug uniqueness
const existingBySlug = await repository.findBySlug(slug);
if (existingBySlug && existingBySlug.id !== currentProjectId) {
  throw new AppError(409, 'Project with this slug already exists');
}
```

### Member Management with Transactions
```typescript
// Add member with transaction
return prisma.$transaction(async (tx) => {
  // 1. Verify project exists
  // 2. Verify user exists and is active
  // 3. Check not already a member
  // 4. Create project member record
});
```

## Database Operations

### Repository Methods
```typescript
create(data)                    // Create project
findById(id)                    // Get project with full details
update(id, data)                // Update project
softDelete(id)                  // Mark as deleted
list(page, limit, filters)      // Paginated list with filters
findByCode(code)                // Check code uniqueness
findBySlug(slug)                // Check slug uniqueness
addMember(projectId, userId)    // Add member (transaction)
removeMember(projectId, userId) // Remove member (transaction)
listMembers(projectId)          // Get all members
isMember(projectId, userId)     // Check membership
```

### Advanced Filtering
```typescript
const where: any = {
  deletedAt: null, // Exclude soft-deleted
};

if (filters.status) {
  where.status = filters.status;
}

if (filters.createdById) {
  where.createdById = filters.createdById;
}

if (filters.search) {
  where.OR = [
    { name: { contains: filters.search, mode: 'insensitive' } },
    { code: { contains: filters.search, mode: 'insensitive' } },
    { slug: { contains: filters.search, mode: 'insensitive' } },
    { description: { contains: filters.search, mode: 'insensitive' } },
  ];
}

// Dynamic sorting
const orderBy: any = {};
orderBy[filters.sortBy || 'createdAt'] = filters.sortOrder || 'desc';
```

## Error Handling

### Status Codes
- `400` - Validation failed, cannot remove creator
- `401` - Authentication required
- `403` - Insufficient permissions
- `404` - Project not found, user not found
- `409` - Duplicate code/slug, already a member
- `500` - Internal server error

### Error Examples
```json
{
  "success": false,
  "error": "Project with this code already exists",
  "timestamp": "2026-07-25T17:00:00.000Z"
}
```

```json
{
  "success": false,
  "error": "Only project creator or Manager can add members",
  "timestamp": "2026-07-25T17:00:00.000Z"
}
```

## Testing Scenarios

### Unit Tests (Service)
```typescript
describe('ProjectService', () => {
  test('should create project with unique code', async () => {
    const mockRepo = {
      findByCode: jest.fn().mockResolvedValue(null),
      findBySlug: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: '1', code: 'PRJ-001' }),
    };
    
    const service = new ProjectService(mockRepo);
    const result = await service.create(validProjectDTO, 'user-id');
    
    expect(result.code).toBe('PRJ-001');
  });

  test('should add member with transaction', async () => {
    const mockRepo = {
      addMember: jest.fn().mockResolvedValue({ id: '1', userId: 'user-2' }),
    };
    
    const service = new ProjectService(mockRepo);
    const result = await service.addMember('project-1', 'user-2');
    
    expect(result.userId).toBe('user-2');
  });
});
```

### Integration Tests
```typescript
describe('POST /api/projects/:id/members', () => {
  test('should add member as project creator', async () => {
    const response = await request(app)
      .post(`/api/projects/${projectId}/members`)
      .set('Authorization', 'Bearer ' + creatorToken)
      .send({ userId: newUserId });
    
    expect(response.status).toBe(201);
    expect(response.body.data.userId).toBe(newUserId);
  });

  test('should reject non-creator', async () => {
    const response = await request(app)
      .post(`/api/projects/${projectId}/members`)
      .set('Authorization', 'Bearer ' + otherUserToken)
      .send({ userId: newUserId });
    
    expect(response.status).toBe(403);
  });
});
```

## Performance Considerations

### Pagination
- Default limit: 20
- Maximum limit: 100
- Efficient counting with `$transaction`

### Database Indexes
Ensure indexes on:
- `projects.code` (unique)
- `projects.slug` (unique)
- `projects.status`
- `projects.created_by_id`
- `projects.deleted_at`
- `project_members(project_id, user_id)` (composite unique)

### Optimized Queries
```typescript
// Fetch list and count in parallel
const [items, total] = await prisma.$transaction([
  prisma.project.findMany({ where, skip, take }),
  prisma.project.count({ where }),
]);
```

## Project Statuses

| Status | Description |
|--------|-------------|
| PLANNING | Initial planning phase |
| ACTIVE | Currently in development |
| TESTING | In testing phase |
| COMPLETED | Project completed |
| ARCHIVED | Archived/closed |

## API Documentation Summary

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/projects` | ✓ | All | List projects |
| POST | `/api/projects` | ✓ | Manager | Create project |
| GET | `/api/projects/:id` | ✓ | All | Get project |
| PATCH | `/api/projects/:id` | ✓ | Manager | Update project |
| DELETE | `/api/projects/:id` | ✓ | Manager | Delete project |
| POST | `/api/projects/:id/members` | ✓ | Creator/Manager | Add member |
| DELETE | `/api/projects/:id/members/:userId` | ✓ | Creator/Manager | Remove member |
| GET | `/api/projects/:id/members` | ✓ | Creator/Member/Manager | List members |

## Implementation Status

✅ **Complete**
- All CRUD operations
- Pagination with filters
- Advanced searching
- Dynamic sorting
- Member management
- Prisma transactions
- Soft delete
- Role-based access control
- Validation with Zod
- Error handling
- Repository pattern
- Service pattern
- REST API design

## Future Enhancements

🔄 **Project Templates** - Create projects from templates
🔄 **Project Cloning** - Duplicate projects
🔄 **Project Archives** - Export project data
🔄 **Member Roles** - Project-specific roles
🔄 **Activity Feed** - Track project changes
🔄 **Project Tags** - Categorize projects
🔄 **Bulk Operations** - Bulk member add/remove
🔄 **Project Settings** - Custom configurations