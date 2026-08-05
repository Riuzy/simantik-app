import { AIGenerator, AIProvider } from './ai-generator';
import { AutomationGenerator } from './automation-generator';
import { TemplateGenerator } from './template-generator';

const templateGenerator = new TemplateGenerator();

const aiGenerators: Record<AIProvider, AutomationGenerator> = {
  GEMINI: new AIGenerator('GEMINI'),
  OPENROUTER: new AIGenerator('OPENROUTER'),
  OLLAMA: new AIGenerator('OLLAMA'),
  OPENAI: new AIGenerator('OPENAI'),
  CUSTOM: new AIGenerator('CUSTOM'),
};

export function getGenerator(provider: string): AutomationGenerator {
  const key = provider.toUpperCase();
  if (key === 'RULE_ENGINE' || key === 'TEMPLATE') return templateGenerator;
  if (key in aiGenerators) return aiGenerators[key as AIProvider];
  return templateGenerator;
}

export function isAIProvider(provider: string): boolean {
  const key = provider.toUpperCase();
  return key in aiGenerators;
}
