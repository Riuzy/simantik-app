import { z } from 'zod';
import { commonQuerySchema, idParamSchema } from '../../../validators/common.validators';

export const projectParamSchema = idParamSchema;

export const slugParamSchema = z.object({
  slug: z.string().min(1).max(255),
});

export const listProjectsQuerySchema = commonQuerySchema.extend({
  status: z.enum(['ACTIVE', 'COMPLETED']).optional(),
  createdById: z.string().uuid('Invalid user ID').optional(),
  framework: z.enum(['PLAYWRIGHT', 'SELENIUM', 'CYPRESS']).optional(),
});

export const createProjectBodySchema = z.object({
  name: z.string().min(2).max(255),
  slug: z.string().min(2).max(255),
  description: z.string().max(500).optional(),
  baseUrl: z.string().url('Invalid URL').optional(),
  framework: z.enum(['PLAYWRIGHT', 'SELENIUM', 'CYPRESS']).default('PLAYWRIGHT'),
  environment: z.string().max(255).optional(),
});

export const updateProjectBodySchema = z.object({
  name: z.string().min(2).max(255).optional(),
  slug: z.string().min(2).max(255).optional(),
  description: z.string().max(500).optional(),
  baseUrl: z.string().url('Invalid URL').optional().nullable(),
  framework: z.enum(['PLAYWRIGHT', 'SELENIUM', 'CYPRESS']).optional(),
  environment: z.string().max(255).optional().nullable(),
  status: z.enum(['ACTIVE', 'COMPLETED']).optional(),
}).refine(d => Object.keys(d).length > 0, { message: 'At least one field required' });
