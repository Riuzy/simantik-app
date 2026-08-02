import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255),
  slug: z.string().min(2).max(255),
  description: z.string().max(500).optional(),
  baseUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  framework: z.enum(['PLAYWRIGHT', 'SELENIUM', 'CYPRESS']).default('PLAYWRIGHT'),
  environment: z.string().max(255).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  slug: z.string().min(2).max(255).optional(),
  description: z.string().max(500).optional(),
  baseUrl: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
  framework: z.enum(['PLAYWRIGHT', 'SELENIUM', 'CYPRESS']).optional(),
  environment: z.string().max(255).optional().nullable(),
  status: z.enum(['ACTIVE', 'COMPLETED']).optional(),
}).refine(d => Object.keys(d).length > 0, { message: 'At least one field required' });

export type CreateProjectForm = z.infer<typeof createProjectSchema>;
export type UpdateProjectForm = z.infer<typeof updateProjectSchema>;
