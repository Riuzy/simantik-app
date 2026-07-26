import { z } from 'zod';

// Common parameter schemas
export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID'),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid UUID'),
});

// Pagination schema
export const paginationQuerySchema = z.object({
  page: z.string()
    .optional()
    .default('1')
    .transform(val => parseInt(val, 10))
    .pipe(z.number().int().min(1)),
  limit: z.string()
    .optional()
    .default('20')
    .transform(val => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(100)),
});

// Search schema
export const searchQuerySchema = z.object({
  search: z.string().optional(),
});

// Sort schema
export const sortQuerySchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Combined common query schema
export const commonQuerySchema = paginationQuerySchema
  .merge(searchQuerySchema)
  .merge(sortQuerySchema);

// Extract types
export type IdParam = z.infer<typeof idParamSchema>;
export type UuidParam = z.infer<typeof uuidParamSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type SortQuery = z.infer<typeof sortQuerySchema>;
export type CommonQuery = z.infer<typeof commonQuerySchema>;