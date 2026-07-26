import { z } from 'zod';
import { ProjectStatus } from '@prisma/client';
import { commonQuerySchema, idParamSchema } from '../../../validators/common.validators';

// Params
export const projectParamSchema = idParamSchema;

export const addMemberParamSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

export const removeMemberParamSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

export const listMembersParamSchema = idParamSchema;

// Query
export const listProjectsQuerySchema = commonQuerySchema.extend({
  status: z.nativeEnum(ProjectStatus).optional(),
  createdById: z.string().uuid('Invalid user ID').optional(),
});

// Body
export const createProjectBodySchema = z.object({
  code: z.string().min(2).max(50),
  name: z.string().min(2).max(255),
  slug: z.string().min(2).max(255),
  description: z.string().max(500).optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const updateProjectBodySchema = z.object({
  name: z.string().min(2).max(255).optional(),
  slug: z.string().min(2).max(255).optional(),
  description: z.string().max(500).optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'At least one field required for update' });