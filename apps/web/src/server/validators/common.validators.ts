import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID'),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const searchQuerySchema = z.object({
  search: z.string().optional(),
});

export const sortQuerySchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const commonQuerySchema = paginationQuerySchema
  .merge(searchQuerySchema)
  .merge(sortQuerySchema);
