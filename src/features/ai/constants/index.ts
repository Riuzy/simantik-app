import { AIProvider } from '../types';

export const AI_PROVIDER_OPTIONS: { value: AIProvider; label: string; description: string }[] = [
  { value: 'RULE_ENGINE', label: 'Rule Engine', description: 'Default. Generator internal tanpa API Key.' },
  { value: 'GEMINI', label: 'Google Gemini', description: 'https://aistudio.google.com/apikey' },
  { value: 'OPENROUTER', label: 'OpenRouter', description: 'https://openrouter.ai/' },
  { value: 'OLLAMA', label: 'Ollama', description: 'Lokal, tanpa API Key.' },
  { value: 'OPENAI', label: 'OpenAI', description: 'https://platform.openai.com/api-keys' },
  { value: 'CUSTOM', label: 'Custom API', description: 'Endpoint OpenAI-compatible.' },
];

export const PROVIDER_MODEL_OPTIONS: Record<Exclude<AIProvider, 'RULE_ENGINE'>, string[]> = {
  GEMINI: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-flash-lite'],
  OPENROUTER: ['deepseek/deepseek-chat', 'google/gemini-2.5-flash', 'qwen/qwen3', 'meta-llama/llama-3.1-8b-instruct'],
  OLLAMA: ['qwen3', 'deepseek-r1', 'llama3.1', 'mistral'],
  OPENAI: ['gpt-5.5', 'gpt-5', 'gpt-4.1'],
  CUSTOM: [],
};

export const OLLAMA_DEFAULT_HOST = 'http://localhost:11434';
