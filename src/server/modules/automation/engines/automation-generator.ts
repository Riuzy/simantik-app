import { Framework } from '@prisma/client';
import { AuthEngine } from '../services/auth-engine.service';
import { ScriptOptions, ScriptStep } from '../services/playwright-script.service';

export type GeneratorType = 'TEMPLATE' | 'AI';

export interface GeneratorContext {
  title: string;
  code: string;
  steps: ScriptStep[];
  options: ScriptOptions;
  framework: Framework;
  authEngine: AuthEngine;
  systemPrompt: string | null;
  scriptPromptTemplate: string | null;
  aiConfig: AIConnectionConfig | null;
  projectName?: string;
  projectBaseUrl?: string;
  projectLoginUrl?: string;
  projectEnvironment?: string;
}

export interface GeneratedScript {
  script: string;
  generatorType: GeneratorType;
  provider: string;
  model: string | null;
}

export interface AIConnectionConfig {
  provider: string;
  apiKey: string | null;
  baseUrl: string | null;
  model: string | null;
  host: string | null;
  temperature: number | null;
  maxTokens: number | null;
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
}

export interface AutomationGenerator {
  readonly key: string;
  generate(context: GeneratorContext): Promise<GeneratedScript>;
  testConnection(config: AIConnectionConfig): Promise<TestConnectionResult>;
}
