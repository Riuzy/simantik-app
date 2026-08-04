import { z } from 'zod';
import { Browser, Framework, LoginMethod, ScreenshotTiming, SessionStrategy } from '@prisma/client';
import { commonQuerySchema, idParamSchema } from '../../../validators/common.validators';

export const projectParamSchema = idParamSchema;

export const slugParamSchema = z.object({
  slug: z.string().min(1).max(255),
});

export const listProjectsQuerySchema = commonQuerySchema.extend({
  status: z.enum(['ACTIVE', 'COMPLETED']).optional(),
  createdById: z.string().uuid('Invalid user ID').optional(),
  framework: z.nativeEnum(Framework).optional(),
  browser: z.nativeEnum(Browser).optional(),
});

const automationFields = {
  baseUrl: z.string().url('Invalid URL').optional().nullable(),
  browser: z.nativeEnum(Browser).optional(),
  environment: z.string().max(255).optional().nullable(),
  headless: z.boolean().optional(),
  timeout: z.number().int().min(1000).max(600000).optional(),
  slowMo: z.number().int().min(0).max(10000).optional(),
  viewportWidth: z.number().int().positive().max(7680).optional(),
  viewportHeight: z.number().int().positive().max(4320).optional(),
  screenshotTiming: z.nativeEnum(ScreenshotTiming).optional(),
  debugMode: z.boolean().optional(),
};

const authenticationFields = {
  authenticationEnabled: z.boolean().optional(),
  loginUrl: z.string().max(500).optional().nullable(),
  loginEmail: z.string().email('Invalid email').optional().nullable(),
  loginPassword: z.string().min(1).max(200).optional().nullable(),
  loginMethod: z.nativeEnum(LoginMethod).optional(),
  sessionStrategy: z.nativeEnum(SessionStrategy).optional(),
};

export const createProjectBodySchema = z.object({
  name: z.string().min(2).max(255),
  slug: z.string().min(2).max(255),
  description: z.string().max(2000).optional().nullable(),
  framework: z.nativeEnum(Framework).default('PLAYWRIGHT'),
  ...automationFields,
  ...authenticationFields,
});

export const updateProjectBodySchema = z
  .object({
    name: z.string().min(2).max(255).optional(),
    slug: z.string().min(2).max(255).optional(),
    description: z.string().max(2000).optional().nullable(),
    framework: z.nativeEnum(Framework).optional(),
    status: z.enum(['ACTIVE', 'COMPLETED']).optional(),
    ...automationFields,
    ...authenticationFields,
  })
  .refine(d => Object.keys(d).length > 0, { message: 'At least one field required' });
