import { z } from 'zod';
import { TestPriority, TestCaseStatus, TestType } from '@prisma/client';
import { commonQuerySchema, idParamSchema } from '../../../validators/common.validators';

export { idParamSchema };

export const TEST_STEP_ACTIONS = [
  'OPEN_BROWSER',
  'NAVIGATE',
  'CLICK',
  'DOUBLE_CLICK',
  'INPUT_TEXT',
  'CLEAR',
  'SELECT',
  'CHECK',
  'UNCHECK',
  'UPLOAD_FILE',
  'PRESS_KEY',
  'WAIT',
  'SCROLL',
  'HOVER',
  'VERIFY_TEXT',
  'VERIFY_URL',
  'VERIFY_ELEMENT',
  'VERIFY_ATTRIBUTE',
  'TAKE_SCREENSHOT',
] as const;

export type TestStepAction = typeof TEST_STEP_ACTIONS[number];

export const stepNumberParamSchema = z.object({
  stepNumber: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1)),
});

export const testCaseAndCodeParamSchema = z.object({
  code: z.string().min(2).max(50),
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
  stepNumber: z.number().int().min(1).optional(),
  action: z.enum(TEST_STEP_ACTIONS),
  target: z.string().max(500).optional(),
  value: z.string().max(1000).optional(),
  expectedResult: z.string().max(1000).optional(),
});

export const reorderStepsBodySchema = z.object({
  stepIds: z.array(z.string().uuid()).min(1),
});

export const updateStepBodySchema = z.object({
  action: z.enum(TEST_STEP_ACTIONS).optional(),
  target: z.string().max(500).optional(),
  value: z.string().max(1000).optional(),
  expectedResult: z.string().max(1000).optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'At least one field required for update' });

export const cloneBodySchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  code: z.string().min(2).max(50),
  title: z.string().min(2).max(255).optional(),
});

export const createTestCaseBodySchema = z.object({
  title: z.string().min(2).max(255),
  description: z.string().max(1000).optional(),
  module: z.string().max(255).optional(),
  priority: z.nativeEnum(TestPriority).optional(),
  testType: z.nativeEnum(TestType).optional(),
  projectId: z.string().uuid('Invalid project ID'),
});

export const updateTestCaseBodySchema = z.object({
  title: z.string().min(2).max(255).optional(),
  description: z.string().max(1000).optional(),
  module: z.string().max(255).optional(),
  priority: z.nativeEnum(TestPriority).optional(),
  testType: z.nativeEnum(TestType).optional(),
  status: z.nativeEnum(TestCaseStatus).optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'At least one field required for update' });

export const listTestCasesQuerySchema = commonQuerySchema.extend({
  projectId: z.string().uuid('Invalid project ID').optional(),
  status: z.nativeEnum(TestCaseStatus).optional(),
  priority: z.nativeEnum(TestPriority).optional(),
  testType: z.nativeEnum(TestType).optional(),
  createdById: z.string().uuid('Invalid user ID').optional(),
  sortBy: z.enum(['createdAt', 'title', 'updatedAt', 'priority']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const listExecutionsQuerySchema = commonQuerySchema.extend({
  status: z.nativeEnum(TestCaseStatus).optional(),
});