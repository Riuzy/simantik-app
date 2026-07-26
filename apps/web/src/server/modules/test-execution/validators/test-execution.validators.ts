import { z } from 'zod';
import { TestRunStatus, ExecutionStatus } from '@prisma/client';
import { commonQuerySchema } from '../../../validators/common.validators';

// Params
export { idParamSchema } from '../../../validators/common.validators';

export const executionParamSchema = z.object({
  testRunId: z.string().uuid('Invalid test run ID'),
  testCaseId: z.string().uuid('Invalid test case ID'),
});

export const testCaseIdsBodySchema = z.object({
  testCaseIds: z.array(z.string().uuid('Invalid test case ID')).min(1, 'At least one test case required'),
});

export const finishTestRunBodySchema = z.object({
  status: z.nativeEnum(TestRunStatus).optional().default('COMPLETED'),
});

// Query
export const listTestRunsQuerySchema = commonQuerySchema.extend({
  projectId: z.string().uuid('Invalid project ID').optional(),
  status: z.nativeEnum(TestRunStatus).optional(),
  executedById: z.string().uuid('Invalid user ID').optional(),
  sortBy: z.enum(['createdAt', 'name', 'startedAt', 'updatedAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const listExecutionsQuerySchema = commonQuerySchema.extend({
  status: z.nativeEnum(ExecutionStatus).optional(),
});

// Body
export const createTestRunBodySchema = z.object({
  code: z.string()
    .min(2).max(50)
    .regex(/^[A-Z0-9-]+$/, 'Code can only contain uppercase letters, numbers, and hyphens'),
  name: z.string().min(2).max(255),
  description: z.string().max(500).optional().transform(val => val || null),
  projectId: z.string().uuid('Invalid project ID'),
  testCaseIds: z.array(z.string().uuid('Invalid test case ID')).min(1, 'At least one test case required'),
});

export const updateTestRunBodySchema = z.object({
  name: z.string().min(2).max(255).optional(),
  description: z.string().max(500).optional().transform(val => val || null),
  status: z.nativeEnum(TestRunStatus).optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'At least one field required for update' });

export const updateExecutionBodySchema = z.object({
  status: z.nativeEnum(ExecutionStatus),
  testerId: z.string().uuid('Invalid tester ID'),
});

export const updateExecutionResultBodySchema = z.object({
  actualResult: z.string().optional().transform(val => val || null),
  environment: z.string().max(100).optional().transform(val => val || null),
  browser: z.string().max(100).optional().transform(val => val || null),
  operatingSystem: z.string().max(100).optional().transform(val => val || null),
  device: z.string().max(100).optional().transform(val => val || null),
  notes: z.string().max(1000).optional().transform(val => val || null),
  duration: z.number().int().min(0).optional(),
});