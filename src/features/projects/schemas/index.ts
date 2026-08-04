import { z } from 'zod';

const emptyToNull = (schema: z.ZodTypeAny) => schema.nullable().or(z.literal('').transform(() => null));

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255),
  slug: z.string().min(2).max(255),
  description: z.string().max(2000).optional(),
  framework: z.enum(['PLAYWRIGHT', 'SELENIUM', 'CYPRESS']).default('PLAYWRIGHT'),
  // Automation
  baseUrl: emptyToNull(z.string().url('Invalid URL')).optional(),
  browser: z.enum(['CHROMIUM', 'FIREFOX', 'WEBKIT']).default('CHROMIUM'),
  environment: z.string().max(255).optional(),
  headless: z.boolean().default(true),
  timeout: z.number().int().min(1000).max(600000).default(30000),
  slowMo: z.number().int().min(0).max(10000).default(0),
  viewportWidth: z.number().int().positive().max(7680).default(1600),
  viewportHeight: z.number().int().positive().max(4320).default(900),
  screenshotTiming: z.enum(['BEFORE_ACTION', 'AFTER_ACTION', 'FINAL_STATE']).default('FINAL_STATE'),
  debugMode: z.boolean().default(false),
  // Authentication
  authenticationEnabled: z.boolean().default(false),
  loginUrl: z.string().max(500).optional(),
  loginEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  loginPassword: z.string().max(200).optional(),
  loginMethod: z.enum(['BROWSER', 'API']).default('BROWSER'),
  sessionStrategy: z.enum(['REUSE_CONTEXT', 'NEW_SESSION']).default('REUSE_CONTEXT'),
});

export const updateProjectSchema = z
  .object({
    name: z.string().min(2).max(255).optional(),
    slug: z.string().min(2).max(255).optional(),
    description: z.string().max(2000).optional().nullable(),
    framework: z.enum(['PLAYWRIGHT', 'SELENIUM', 'CYPRESS']).optional(),
    status: z.enum(['ACTIVE', 'COMPLETED']).optional(),
    // Automation
    baseUrl: emptyToNull(z.string().url('Invalid URL')).optional(),
    browser: z.enum(['CHROMIUM', 'FIREFOX', 'WEBKIT']).optional(),
    environment: z.string().max(255).optional().nullable(),
    headless: z.boolean().optional(),
    timeout: z.number().int().min(1000).max(600000).optional(),
    slowMo: z.number().int().min(0).max(10000).optional(),
    viewportWidth: z.number().int().positive().max(7680).optional(),
    viewportHeight: z.number().int().positive().max(4320).optional(),
    screenshotTiming: z.enum(['BEFORE_ACTION', 'AFTER_ACTION', 'FINAL_STATE']).optional(),
    debugMode: z.boolean().optional(),
    // Authentication
    authenticationEnabled: z.boolean().optional(),
    loginUrl: z.string().max(500).optional().nullable(),
    loginEmail: z.string().email('Invalid email').optional().nullable().or(z.literal('')),
    loginPassword: z.string().max(200).optional().nullable(),
    loginMethod: z.enum(['BROWSER', 'API']).optional(),
    sessionStrategy: z.enum(['REUSE_CONTEXT', 'NEW_SESSION']).optional(),
  })
  .refine(d => Object.keys(d).length > 0, { message: 'At least one field required' });

export type CreateProjectForm = z.infer<typeof createProjectSchema>;
export type UpdateProjectForm = z.infer<typeof updateProjectSchema>;
