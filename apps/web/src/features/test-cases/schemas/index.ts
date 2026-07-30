import { z } from 'zod';

export const createTestCaseSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(255),
  description: z.string().max(1000).optional(),
  module: z.string().max(255).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  testType: z.enum(['MANUAL', 'AUTOMATION']).default('MANUAL'),
  projectId: z.string().uuid('Invalid project ID'),
});

export const updateTestCaseSchema = z.object({
  title: z.string().min(2).max(255).optional(),
  description: z.string().max(1000).optional(),
  module: z.string().max(255).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  testType: z.enum(['MANUAL', 'AUTOMATION']).optional(),
  status: z.enum(['DRAFT', 'READY', 'OBSOLETE']).optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'At least one field required for update' });

export const createTestStepSchema = z.object({
  action: z.enum([
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
  ]),
  target: z.string().max(500).optional(),
  value: z.string().max(1000).optional(),
  expectedResult: z.string().max(1000).optional(),
});

export const updateTestStepSchema = z.object({
  action: z.enum([
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
  ]).optional(),
  target: z.string().max(500).optional(),
  value: z.string().max(1000).optional(),
  expectedResult: z.string().max(1000).optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'At least one field required for update' });

export const reorderTestStepsSchema = z.object({
  stepIds: z.array(z.string().uuid()).min(1),
});

export type CreateTestCaseForm = z.infer<typeof createTestCaseSchema>;
export type UpdateTestCaseForm = z.infer<typeof updateTestCaseSchema>;
export type CreateTestStepForm = z.infer<typeof createTestStepSchema>;
export type UpdateTestStepForm = z.infer<typeof updateTestStepSchema>;
export type ReorderTestStepsForm = z.infer<typeof reorderTestStepsSchema>;