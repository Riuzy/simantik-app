import { z } from 'zod';
import { commonQuerySchema, idParamSchema } from '../../../validators/common.validators';

export const projectParamSchema = idParamSchema;

export const addMemberParamSchema = z.object({ userId: z.string().uuid('Invalid user ID') });
export const removeMemberParamSchema = z.object({ userId: z.string().uuid('Invalid user ID') });
export const listMembersParamSchema = idParamSchema;

export const listProjectsQuerySchema = commonQuerySchema.extend({
  status: z.enum(['ACTIVE', 'COMPLETED']).optional(),
  createdById: z.string().uuid('Invalid user ID').optional(),
});

export const createProjectBodySchema = z.object({
  name: z.string().min(2).max(255),
  slug: z.string().min(2).max(255),
  description: z.string().max(500).optional(),
});

export const updateProjectBodySchema = z.object({
  name: z.string().min(2).max(255).optional(),
  slug: z.string().min(2).max(255).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(['ACTIVE', 'COMPLETED']).optional(),
}).refine(d => Object.keys(d).length > 0, { message: 'At least one field required' });
