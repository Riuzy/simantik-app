import { AIProvider } from '../types';

export const AI_PROVIDER_OPTIONS: { value: AIProvider; label: string; description: string }[] = [
  { value: 'RULE_ENGINE', label: 'Built-in Template', description: 'Default. Internal generator without API Key.' },
  { value: 'GEMINI', label: 'Google Gemini', description: 'https://aistudio.google.com/apikey' },
  { value: 'OPENROUTER', label: 'OpenRouter', description: 'https://openrouter.ai/' },
  { value: 'OPENAI', label: 'OpenAI', description: 'https://platform.openai.com/api-keys' },
  { value: 'OLLAMA', label: 'Ollama', description: 'Local, without API Key.' },
  { value: 'CUSTOM', label: 'Custom API', description: 'OpenAI-compatible custom endpoint.' },
];

export const PROVIDER_MODEL_OPTIONS: Record<Exclude<AIProvider, 'RULE_ENGINE'>, string[]> = {
  GEMINI: ['gemini-3.1-flash-lite', 'gemini-3-flash-preview', 'gemini-2.5-pro'],
  OPENROUTER: ['deepseek/deepseek-chat', 'google/gemini-2.5-flash', 'qwen/qwen3', 'meta-llama/llama-3.1-8b-instruct'],
  OLLAMA: ['qwen3', 'deepseek-r1', 'llama3.1', 'mistral'],
  OPENAI: ['gpt-5.5', 'gpt-5', 'gpt-4.1'],
  CUSTOM: [],
};

export const OLLAMA_DEFAULT_HOST = 'http://localhost:11434';
