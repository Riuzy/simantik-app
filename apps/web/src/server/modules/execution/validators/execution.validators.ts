import { z } from 'zod';
import { ExecutionStatus } from '@prisma/client';
import { commonQuerySchema, idParamSchema } from '../../../validators/common.validators';

export { idParamSchema };

export const executionProjectParamSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
});

export const executionTestCaseParamSchema = z.object({
  testCaseId: z.string().uuid('Invalid test case ID'),
});

export const listExecutionsQuerySchema = commonQuerySchema.extend({
  projectId: z.string().uuid('Invalid project ID').optional(),
  testCaseId: z.string().uuid('Invalid test case ID').optional(),
  status: z.nativeEnum(ExecutionStatus).optional(),
});

export const retryExecutionBodySchema = z.object({
  headless: z.boolean().optional(),
  browser: z.string().optional(),
  viewportWidth: z.number().int().positive().optional(),
  viewportHeight: z.number().int().positive().optional(),
});
