import { z } from 'zod';
import { TestPriority, TestCaseStatus, TestCaseType, TestCaseLastResult } from '@prisma/client';
import { TEST_STEP_ACTIONS, LOCATOR_STRATEGIES } from '../../../../constants/test-step-actions';
import { commonQuerySchema, idParamSchema } from '../../../validators/common.validators';

export { idParamSchema };

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

export const locatorItemSchema = z.object({
  strategy: z.enum(LOCATOR_STRATEGIES),
  value: z.string().min(1).max(500),
});

export const createStepBodySchema = z.object({
  stepNumber: z.number().int().min(1).optional(),
  action: z.enum(TEST_STEP_ACTIONS),
  description: z.string().max(500).optional(),
  locatorStrategy: z.enum(LOCATOR_STRATEGIES).optional(),
  locatorValue: z.string().max(500).optional(),
  locators: z.array(locatorItemSchema).max(20).optional(),
  inputValue: z.string().max(1000).optional(),
  expectedResult: z.string().max(1000).optional(),
});

export const reorderStepsBodySchema = z.object({
  stepIds: z.array(z.string().uuid()).min(1),
});

export const updateStepBodySchema = z.object({
  action: z.enum(TEST_STEP_ACTIONS).optional(),
  description: z.string().max(500).optional(),
  locatorStrategy: z.enum(LOCATOR_STRATEGIES).optional(),
  locatorValue: z.string().max(500).optional(),
  locators: z.array(locatorItemSchema).max(20).optional(),
  inputValue: z.string().max(1000).optional(),
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
  status: z.nativeEnum(TestCaseStatus).optional(),
  type: z.nativeEnum(TestCaseType).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  projectId: z.string().uuid('Invalid project ID'),
});

export const updateTestCaseBodySchema = z.object({
  title: z.string().min(2).max(255).optional(),
  description: z.string().max(1000).optional(),
  module: z.string().max(255).optional(),
  priority: z.nativeEnum(TestPriority).optional(),
  status: z.nativeEnum(TestCaseStatus).optional(),
  type: z.nativeEnum(TestCaseType).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'At least one field required for update' });

export const listTestCasesQuerySchema = commonQuerySchema.extend({
  projectId: z.string().uuid('Invalid project ID').optional(),
  priority: z.nativeEnum(TestPriority).optional(),
  status: z.nativeEnum(TestCaseStatus).optional(),
  type: z.nativeEnum(TestCaseType).optional(),
  lastResult: z.nativeEnum(TestCaseLastResult).optional(),
  module: z.string().max(255).optional(),
  tag: z.string().max(50).optional(),
  createdById: z.string().uuid('Invalid user ID').optional(),
  sortBy: z.enum(['createdAt', 'title', 'updatedAt', 'priority', 'code', 'status', 'type', 'module', 'project', 'lastResult']).optional().default('code'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});
