# User Module

## Overview

Complete user management system with CRUD operations, profile management, and advanced filtering.

## Features

✅ **List Users**
- Pagination
- Search by name, email, job title
- Filter by role
- Filter by active status
- Sorting by creation date

✅ **Create User**
- Email uniqueness validation
- Role verification
- Password hashing
- Avatar support

✅ **Update User**
- Update basic info
- Change role
- Activate/deactivate

✅ **Delete User (Soft Delete)**
- Marks as deleted
- Sets isActive to false
- Preserves data

✅ **Update Profile**
- Personal information
- Job details
- Bio

✅ **Change Password**
- Current password verification
- Strong password requirements
- Password hashing

✅ **Update Avatar**
- Avatar URL/path update
- Ownership validation

## Architecture

```
Routes → Controller → Service → Repository → Prisma
```

## API Endpoints

### GET /api/users
List users with pagination and filters

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 20) - Items per page (max: 100)
- `roleId` - Filter by role UUID
- `isActive` - true/false for active status
- `search` - Search in name, email, job title

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": null,
      "jobTitle": "QA Engineer",
      "isActive": true,
      "lastLoginAt": "2026-07-25T16:00:00.000Z",
      "createdAt": "2026-07-20T10:00:00.000Z",
      "role": {
        "id": "role-uuid",
        "name": "Tester"
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
  }
}
```

### GET /api/users/roles
Get all available roles

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": "uuid-1", "name": "Manager" },
    { "id": "uuid-2", "name": "Tester" },
    { "id": "uuid-3", "name": "Developer" }
  ]
}
```

### POST /api/users
Create new user (Manager only)

**Headers:**
```
Authorization: Bearer <access-token> (Manager)
```

**Request:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "SecurePass123",
  "phoneNumber": "+1234567890",
  "jobTitle": "QA Lead",
  "bio": "Experienced QA professional",
  "roleId": "role-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "avatar": null,
    "phoneNumber": "+1234567890",
    "jobTitle": "QA Lead",
    "bio": "Experienced QA professional",
    "isActive": true,
    "lastLoginAt": null,
    "createdAt": "2026-07-25T16:45:00.000Z",
    "updatedAt": "2026-07-25T16:45:00.000Z",
    "role": {
      "id": "role-uuid",
      "name": "Tester"
    }
  }
}
```

### GET /api/users/:id
Get user by ID

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:** Same as POST response

### PUT /api/users/:id
Update user (Manager only)

**Headers:**
```
Authorization: Bearer <access-token> (Manager)
```

**Request:**
```json
{
  "name": "Jane Updated",
  "phoneNumber": "+9876543210",
  "isActive": true,
  "roleId": "new-role-uuid"
}
```

**Response:** Updated user object

### DELETE /api/users/:id
Soft delete user (Manager only)

**Headers:**
```
Authorization: Bearer <access-token> (Manager)
```

**Response:** 204 No Content

### PATCH /api/users/:id/password
Change password (own password or Manager)

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewSecurePass456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully"
  }
}
```

### PATCH /api/users/:id/profile
Update profile (own profile or Manager)

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request:**
```json
{
  "name": "Updated Name",
  "phoneNumber": "+1234567890",
  "jobTitle": "Senior QA",
  "bio": "Updated bio information"
}
```

**Response:** Updated user object

### PATCH /api/users/:id/avatar
Update avatar (own avatar or Manager)

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request:**
```json
{
  "avatar": "https://example.com/avatars/john.jpg"
}
```

**Response:** Updated user object with new avatar

## Access Control

### User Permissions
- **All authenticated users** can list users and get user details
- **Users** can update their own profile, password, and avatar
- **Managers** can perform all operations on all users
- **Users cannot** update other users' profiles unless they're Managers

### Authorization Flow
```typescript
// User trying to update someone else's profile
if (currentUserId !== targetUserId && !isManager) {
  throw new AppError(403, 'You can only update your own profile');
}
```

## Validation Rules

### User Creation
- Name: 2-255 characters
- Email: Valid format, max 255 characters
- Password: 8-128 chars, uppercase, lowercase, number
- Phone number: Max 20 characters (optional)
- Job title: Max 100 characters (optional)
- Bio: Max 500 characters (optional)
- Role ID: Must be valid UUID

### User Update
- At least one field must be provided
- Email must be unique if changing
- Role must exist if changing

### Password Change
- Current password must match
- New password: Same requirements as creation

## Business Logic

### Soft Delete Implementation
```typescript
await this.repository.softDelete(id);
// Sets:
// - deletedAt = current timestamp
// - isActive = false
// - Preserves all other data
```

### Password Security
- All passwords hashed with bcrypt (10 rounds)
- Passwords never returned in responses
- Strong password requirements enforced

### Email Uniqueness
```typescript
const existingUser = await this.repository.findByEmail(email);
if (existingUser && existingUser.id !== id) {
  throw new AppError(409, 'Email already in use');
}
```

## Database Operations

### Repository Methods
```typescript
create(data)          // Create user with password hash
findById(id)          // Get user by ID (excluding deleted)
findByIdWithPassword(id) // Get user with password field
findByEmail(email)    // Get user by email
update(id, data)      // Update user
softDelete(id)        // Mark as deleted
list(page, limit, filters) // Paginated list with filters
findRoleById(id)      // Verify role exists
findAllRoles()        // Get all roles
```

### Query Filters
```typescript
const where: any = {
  deletedAt: null,    // Exclude soft-deleted
};

if (roleId) {
  where.roleId = roleId;
}

if (isActive !== undefined) {
  where.isActive = isActive;
}

if (search) {
  where.OR = [
    { name: { contains: search, mode: 'insensitive' } },
    { email: { contains: search, mode: 'insensitive' } },
    { jobTitle: { contains: search, mode: 'insensitive' } },
  ];
}
```

## Error Handling

### Status Codes
- `400` - Validation failed, invalid role
- `401` - Authentication required
- `403` - Insufficient permissions
- `404` - User not found
- `409` - Email already exists
- `500` - Internal server error

### Error Examples
```json
{
  "success": false,
  "error": "Email already in use",
  "timestamp": "2026-07-25T16:45:00.000Z"
}
```

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "code": "invalid_string",
      "path": ["body", "password"],
      "message": "Password must contain at least one uppercase letter"
    }
  ]
}
```

## Security Considerations

✅ **Password Security**
- Bcrypt hashing
- Strong password requirements
- Current password verification

✅ **Access Control**
- Role-based permissions
- Ownership validation
- Manager-only operations

✅ **Data Privacy**
- Soft delete preserves data
- Users can't see others' sensitive info
- Password never exposed

✅ **Input Validation**
- Zod schemas for all endpoints
- SQL injection prevention via Prisma
- Email format validation

## Testing Scenarios

### Unit Tests (Service)
```typescript
describe('UserService', () => {
  test('should create user with hashed password', async () => {
    const mockRepo = {
      findByEmail: jest.fn().mockResolvedValue(null),
      findRoleById: jest.fn().mockResolvedValue({ id: '1', name: 'Tester' }),
      create: jest.fn().mockResolvedValue({ id: '1', email: 'test@test.com' }),
    };
    
    const service = new UserService(mockRepo);
    const result = await service.create(validUserDTO);
    
    expect(result.email).toBe('test@test.com');
    expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      password: expect.stringMatching(/^\$2b\$10\$/), // bcrypt hash pattern
    }));
  });
});
```

### Integration Tests
```typescript
describe('GET /api/users', () => {
  test('should return paginated users', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer ' + managerToken)
      .query({ page: 1, limit: 10 });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.pagination).toHaveProperty('total');
  });
});
```

## Performance Considerations

### Pagination
- Default limit: 20
- Maximum limit: 100
- Skip calculation: `(page - 1) * limit`

### Database Indexes
Ensure indexes on:
- `users.email` (unique)
- `users.role_id`
- `users.deleted_at`
- `users.is_active`

### Query Optimization
```typescript
// Efficient counting
const [items, total] = await Promise.all([
  prisma.user.findMany({ where, skip, take: limit }),
  prisma.user.count({ where }),
]);
```

## API Documentation Summary

| Method | Endpoint | Authentication | Description |
|--------|----------|----------------|-------------|
| GET | `/api/users` | Required | List users with filters |
| GET | `/api/users/roles` | Required | Get all roles |
| POST | `/api/users` | Manager only | Create user |
| GET | `/api/users/:id` | Required | Get user by ID |
| PUT | `/api/users/:id` | Manager only | Update user |
| DELETE | `/api/users/:id` | Manager only | Soft delete user |
| PATCH | `/api/users/:id/password` | Required | Change password |
| PATCH | `/api/users/:id/profile` | Required | Update profile |
| PATCH | `/api/users/:id/avatar` | Required | Update avatar |

## Dependencies

```json
{
  "bcrypt": "^5.1.1",
  "zod": "^3.24.1"
}
```

## Implementation Status

✅ **Complete**
- All CRUD operations
- Pagination and filtering
- Profile management
- Password change
- Avatar update
- Soft delete
- Role-based access control
- Validation with Zod
- Error handling
- Repository pattern
- Service pattern
- REST API design

## Future Enhancements

🔄 **Export Users** - CSV/Excel export
🔄 **Bulk Operations** - Bulk create/update/delete
🔄 **User Permissions** - Granular permissions beyond roles
🔄 **Activity Logging** - Track user modifications
🔄 **Profile Pictures** - Upload and resize
🔄 **Notification Preferences** - User notification settings
🔄 **Two-Factor Authentication** - TOTP setup and management