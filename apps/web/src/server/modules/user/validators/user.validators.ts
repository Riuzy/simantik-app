import { z } from 'zod';
import { idParamSchema } from '../../../validators/common.validators';

// Params
export const userIdParamSchema = idParamSchema;

// Body - Manager creates user with temporary password
export const createUserBodySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name cannot exceed 255 characters'),
  email: z.string().email('Invalid email format').max(255, 'Email cannot exceed 255 characters'),
  roleId: z.string().uuid('Invalid role ID'),
  temporaryPassword: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password cannot exceed 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  phoneNumber: z.string().max(20, 'Phone number cannot exceed 20 characters').optional(),
  jobTitle: z.string().max(100, 'Job title cannot exceed 100 characters').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
});

// Body - Update user (Manager only)
export const updateUserBodySchema = z.object({
  name: z.string().min(2).max(255).optional(),
  phoneNumber: z.string().max(20).optional(),
  jobTitle: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
  roleId: z.string().uuid('Invalid role ID').optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'At least one field required for update' });

// Body - Reset password by Manager (new temporary password)
export const resetPasswordBodySchema = z.object({
  temporaryPassword: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password cannot exceed 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const changeRoleBodySchema = z.object({
  roleId: z.string().uuid('Invalid role ID'),
});

// Query
export const listUsersQuerySchema = z.object({
  page: z.string().optional().default('1').transform(val => parseInt(val, 10)).pipe(z.number().int().min(1)),
  limit: z.string().optional().default('20').transform(val => parseInt(val, 10)).pipe(z.number().int().min(1).max(100)),
  roleId: z.string().uuid('Invalid role ID').optional(),
  isActive: z.string().optional().transform(val => val === 'true'),
  search: z.string().optional(),
});