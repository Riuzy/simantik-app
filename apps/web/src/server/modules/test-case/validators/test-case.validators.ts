import { z } from 'zod';
import { TestPriority, TestCaseStatus } from '@prisma/client';
import { commonQuerySchema } from '../../../validators/common.validators';

// Params
export { idParamSchema } from '../../../validators/common.validators';

export const stepNumberParamSchema = z.object({
  stepNumber: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1)),
});

export const testCaseAndStepParamSchema = z.object({
  testCaseId: z.string().uuid('Invalid test case ID'),
  stepNumber: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1)),
});

export const duplicateBodySchema = z.object({
  code: z.string().min(2).max(50),
  title: z.string().min(2).max(255).optional(),
});

export const createStepBodySchema = z.object({
  stepNumber: z.number().int().min(1),
  action: z.string().min(1),
  expectedResult: z.string().min(1),
});

export const updateStepBodySchema = z.object({
  action: z.string().min(1).optional(),
  expectedResult: z.string().min(1).optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'At least one field required for update' });

export const cloneBodySchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  code: z.string().min(2).max(50),
  title: z.string().min(2).max(255).optional(),
});

// Body
export const createTestCaseBodySchema = z.object({
  code: z.string().min(2).max(50),
  title: z.string().min(2).max(255),
  description: z.string().max(500).optional(),
  precondition: z.string().max(500).optional(),
  priority: z.nativeEnum(TestPriority).optional(),
  status: z.nativeEnum(TestCaseStatus).optional(),
  projectId: z.string().uuid('Invalid project ID'),
});

export const updateTestCaseBodySchema = z.object({
  title: z.string().min(2).max(255).optional(),
  description: z.string().max(500).optional(),
  precondition: z.string().max(500).optional(),
  priority: z.nativeEnum(TestPriority).optional(),
  status: z.nativeEnum(TestCaseStatus).optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'At least one field required for update' });

// Query
export const listTestCasesQuerySchema = commonQuerySchema.extend({
  projectId: z.string().uuid('Invalid project ID').optional(),
  status: z.nativeEnum(TestCaseStatus).optional(),
  priority: z.nativeEnum(TestPriority).optional(),
  createdById: z.string().uuid('Invalid user ID').optional(),
  sortBy: z.enum(['createdAt', 'title', 'updatedAt', 'priority']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const listExecutionsQuerySchema = commonQuerySchema.extend({
  status: z.nativeEnum(TestCaseStatus).optional(),
});