export type AIProvider = 'RULE_ENGINE' | 'GEMINI' | 'OPENROUTER' | 'OLLAMA' | 'OPENAI' | 'CUSTOM';

export interface AISettings {
  id: string | null;
  enabled: boolean;
  provider: AIProvider;
  apiKey: string | null;
  apiKeyConfigured: boolean;
  baseUrl: string | null;
  model: string | null;
  host: string | null;
  temperature: number | null;
  maxTokens: number | null;
  updatedAt: string | null;
}

export interface SaveAISettingsForm {
  enabled?: boolean;
  provider: AIProvider;
  apiKey?: string | null;
  baseUrl?: string | null;
  model?: string | null;
  host?: string | null;
  temperature?: number | null;
  maxTokens?: number | null;
}

export interface TestConnectionForm {
  provider: AIProvider;
  apiKey?: string | null;
  baseUrl?: string | null;
  model?: string | null;
  host?: string | null;
  temperature?: number | null;
  maxTokens?: number | null;
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
}

export interface PromptTemplates {
  system: string;
  scriptGenerator: string;
  expectedResult: string;
  testCase: string;
  locatorGenerator: string;
  executionAnalysis: string;
}
