import { z } from 'zod';
import { idParamSchema } from '../../../validators/common.validators';

export { idParamSchema };

export const projectIdParamSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
});

export const testCaseIdParamSchema = z.object({
  testCaseId: z.string().uuid('Invalid test case ID'),
});

export const runTestBodySchema = z.object({
  headless: z.boolean().optional(),
});

export const generateScriptBodySchema = z.object({
  method: z.enum(['TEMPLATE', 'AI']).optional(),
  provider: z.string().optional(),
  model: z.string().optional(),
  apiKey: z.string().optional(),
  baseUrl: z.string().optional(),
  host: z.string().optional(),
});