import { z } from 'zod';
import { Framework, Browser } from '@prisma/client';
import { idParamSchema } from '../../../validators/common.validators';

export { idParamSchema };

export const projectIdParamSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
});

export const testCaseIdParamSchema = z.object({
  testCaseId: z.string().uuid('Invalid test case ID'),
});

export const upsertAutomationConfigBodySchema = z.object({
  framework: z.nativeEnum(Framework).optional(),
  browser: z.nativeEnum(Browser).optional(),
  baseUrl: z.string().url('Invalid URL').optional().nullable(),
  headless: z.boolean().optional(),
  viewportWidth: z.number().int().positive().max(7680).optional(),
  viewportHeight: z.number().int().positive().max(4320).optional(),
  timeout: z.number().int().positive().max(600000).optional(),
  retry: z.number().int().min(0).max(10).optional(),
  parallel: z.number().int().min(1).max(10).optional(),
  slowMotion: z.number().int().min(0).max(10000).optional(),
});

export const runTestBodySchema = z.object({
  headless: z.boolean().optional(),
});
