import { z } from 'zod';

export const AI_PROVIDER_VALUES = ['RULE_ENGINE', 'GEMINI', 'OPENROUTER', 'OLLAMA', 'OPENAI', 'CUSTOM'] as const;

export const saveAISettingSchema = z.object({
  enabled: z.boolean().optional(),
  provider: z.enum(AI_PROVIDER_VALUES).default('RULE_ENGINE'),
  apiKey: z.string().optional().nullable(),
  baseUrl: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  host: z.string().optional().nullable(),
});

export const testConnectionSchema = z.object({
  provider: z.enum(AI_PROVIDER_VALUES),
  apiKey: z.string().optional().nullable(),
  baseUrl: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  host: z.string().optional().nullable(),
});

export const PROMPT_TEMPLATE_KEYS = [
  'system',
  'scriptGenerator',
  'expectedResult',
  'testCase',
  'locatorGenerator',
  'executionAnalysis',
] as const;

export const promptTemplateSchema = z.object({
  key: z.enum(PROMPT_TEMPLATE_KEYS),
  content: z.string(),
});
