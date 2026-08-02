import { z } from 'zod';
import { TEST_STEP_ACTIONS, LOCATOR_STRATEGIES } from '../../../constants/test-step-actions';

export const createTestCaseSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(255),
  description: z.string().max(1000).optional(),
  module: z.string().max(255).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  status: z.enum(['DRAFT', 'READY', 'ARCHIVED']).default('DRAFT'),
  tags: z.array(z.string().max(50)).max(20).optional(),
  projectId: z.string().uuid('Invalid project ID'),
});

export const updateTestCaseSchema = z.object({
  title: z.string().min(2).max(255).optional(),
  description: z.string().max(1000).optional(),
  module: z.string().max(255).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  status: z.enum(['DRAFT', 'READY', 'ARCHIVED']).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'At least one field required for update' });

const testStepFields = {
  action: z.enum(TEST_STEP_ACTIONS),
  description: z.string().max(500).optional(),
  locatorStrategy: z.enum(LOCATOR_STRATEGIES).optional(),
  locatorValue: z.string().max(500).optional(),
  inputValue: z.string().max(1000).optional(),
  expectedResult: z.string().max(1000).optional(),
};

export const createTestStepSchema = z.object(testStepFields);

export const updateTestStepSchema = z
  .object({
    action: z.enum(TEST_STEP_ACTIONS).optional(),
    description: z.string().max(500).optional(),
    locatorStrategy: z.enum(LOCATOR_STRATEGIES).optional(),
    locatorValue: z.string().max(500).optional(),
    inputValue: z.string().max(1000).optional(),
    expectedResult: z.string().max(1000).optional(),
  })
  .refine(data => Object.keys(data).length > 0, { message: 'At least one field required for update' });

export const reorderTestStepsSchema = z.object({
  stepIds: z.array(z.string().uuid()).min(1),
});

export type CreateTestCaseForm = z.infer<typeof createTestCaseSchema>;
export type UpdateTestCaseForm = z.infer<typeof updateTestCaseSchema>;
export type CreateTestStepForm = z.infer<typeof createTestStepSchema>;
export type UpdateTestStepForm = z.infer<typeof updateTestStepSchema>;
export type ReorderTestStepsForm = z.infer<typeof reorderTestStepsSchema>;
