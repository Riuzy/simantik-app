import {
  AutomationGenerator,
  AIConnectionConfig,
  GeneratedScript,
  GeneratorContext,
  GeneratorType,
  TestConnectionResult,
} from './automation-generator';

export const AI_PROVIDER_GEMINI = 'GEMINI';
export const AI_PROVIDER_OPENROUTER = 'OPENROUTER';
export const AI_PROVIDER_OLLAMA = 'OLLAMA';
export const AI_PROVIDER_OPENAI = 'OPENAI';
export const AI_PROVIDER_CUSTOM = 'CUSTOM';

export const AI_PROVIDERS = [
  AI_PROVIDER_GEMINI,
  AI_PROVIDER_OPENROUTER,
  AI_PROVIDER_OLLAMA,
  AI_PROVIDER_OPENAI,
  AI_PROVIDER_CUSTOM,
] as const;

export type AIProvider = (typeof AI_PROVIDERS)[number];

export const AI_PROVIDER_LABELS: Record<AIProvider, string> = {
  GEMINI: 'Google Gemini',
  OPENROUTER: 'OpenRouter',
  OLLAMA: 'Ollama',
  OPENAI: 'OpenAI',
  CUSTOM: 'Custom API',
};

interface ProviderCall {
  url: string;
  options: RequestInit;
  parseText: (data: unknown) => string;
}

function stripCodeFences(text: string): string {
  const cleaned = text.trim();
  const fenced = cleaned.match(/```(?:[a-zA-Z]+)?\s*([\s\S]*?)```/);
  return (fenced ? fenced[1] : cleaned).trim();
}

function defaultSystemPrompt(): string {
  return [
    'Kamu adalah QA Automation Engineer berpengalaman.',
    'Kamu menghasilkan script Playwright yang lengkap, benar, dan siap dijalankan.',
    'Gunakan lokator yang stabil dan self-healing.',
    'Jangan menambahkan komentar yang tidak perlu.',
  ].join('\n');
}

function defaultScriptPromptTemplate(): string {
  return [
    'Buatkan script automation Playwright untuk test case berikut.',
    '',
    'Test Case: {title}',
    'Kode: {code}',
    'Framework: {framework}',
    '',
    'Test Steps:',
    '{steps}',
    '',
    'Aturan:',
    '- Output HANYA kode script mentah (plain Node.js + Playwright), tanpa markdown fence, tanpa penjelasan.',
    '- Gunakan `const { chromium } = require(\'playwright\');`.',
    '- Kirim log lewat console.log dengan awalan `LOG:LEVEL:pesan` (misal `LOG:INFO:...`).',
    '- Di akhir, kirim `RESULT:{"status":"PASSED"|"FAILED","error":"..."}` sebagai JSON string.',
    '- Bungkus semua langkah dalam try/catch. Setiap langkah diberi nomor.',
    '- Verifikasi hasil sesuai Expected Result setiap langkah.',
  ].join('\n');
}

export class AIGenerator implements AutomationGenerator {
  readonly key = 'AI';

  constructor(private readonly provider: AIProvider) {}

  async generate(context: GeneratorContext): Promise<GeneratedScript> {
    const system = context.systemPrompt || defaultSystemPrompt();
    const template = context.scriptPromptTemplate || defaultScriptPromptTemplate();
    const prompt = template
      .replaceAll('{title}', context.title)
      .replaceAll('{code}', context.code)
      .replaceAll('{framework}', context.framework)
      .replaceAll('{steps}', this.serializeSteps(context.steps));

    const config: AIConnectionConfig = context.aiConfig ?? {
      provider: this.provider,
      apiKey: null,
      baseUrl: null,
      model: null,
      host: null,
      temperature: null,
      maxTokens: null,
    };

    const content = await this.callModel(config, system, prompt);

    return {
      script: stripCodeFences(content),
      generatorType: 'AI',
      provider: this.provider,
      model: config.model,
    };
  }

  async testConnection(config: AIConnectionConfig): Promise<TestConnectionResult> {
    try {
      const call = this.buildHealthCall(config);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(call.url, call.options);
      clearTimeout(timer);

      if (!res.ok) {
        return {
          success: false,
          message: `Connection failed (HTTP ${res.status}): ${(await res.text()).slice(0, 300)}`,
        };
      }
      return { success: true, message: 'Connection success' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: `Connection failed: ${message}` };
    }
  }

  private async callModel(config: AIConnectionConfig, system: string, prompt: string): Promise<string> {
    const call = this.buildGenerateCall(config, system, prompt);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 120000);
    const res = await fetch(call.url, call.options);
    clearTimeout(timer);

    if (!res.ok) {
      const detail = (await res.text()).slice(0, 500);
      throw new Error(`${config.provider} request failed (HTTP ${res.status}): ${detail}`);
    }

    const data = await res.json();
    const text = call.parseText(data);
    if (!text) throw new Error(`${config.provider} returned an empty response`);
    return text;
  }

  private serializeSteps(steps: GeneratorContext['steps']): string {
    return steps
      .map((step) => {
        const parts = [`${step.stepNumber}. ${step.action}`];
        if (step.locatorValue) parts.push(`   lokator: ${step.locatorStrategy}="${step.locatorValue}"`);
        if (step.inputValue) parts.push(`   input: "${step.inputValue}"`);
        if (step.expectedResult) parts.push(`   expected: ${step.expectedResult}`);
        return parts.join('\n');
      })
      .join('\n');
  }

  private buildGenerateCall(config: AIConnectionConfig, system: string, prompt: string): ProviderCall {
    const messages = [{ role: 'system', content: system }, { role: 'user', content: prompt }];
    const completionBody = {
      model: config.model,
      messages,
      ...(config.temperature != null ? { temperature: config.temperature } : {}),
      ...(config.maxTokens != null ? { max_tokens: config.maxTokens } : {}),
    };

    switch (config.provider) {
      case AI_PROVIDER_GEMINI:
        return this.geminiGenerate(config, prompt);
      case AI_PROVIDER_OPENROUTER:
        return {
          url: 'https://openrouter.ai/api/v1/chat/completions',
          options: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
            body: JSON.stringify(completionBody),
          },
          parseText: (data) => this.pick(data, ['choices', 0, 'message', 'content']) ?? '',
        };
      case AI_PROVIDER_OPENAI:
        return {
          url: 'https://api.openai.com/v1/chat/completions',
          options: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
            body: JSON.stringify(completionBody),
          },
          parseText: (data) => this.pick(data, ['choices', 0, 'message', 'content']) ?? '',
        };
      case AI_PROVIDER_OLLAMA:
        return {
          url: `${config.host || 'http://localhost:11434'}/api/chat`,
          options: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: config.model,
              messages,
              stream: false,
              options: {
                ...(config.temperature != null ? { temperature: config.temperature } : {}),
                ...(config.maxTokens != null ? { num_predict: config.maxTokens } : {}),
              },
            }),
          },
          parseText: (data) => this.pick(data, ['message', 'content']) ?? '',
        };
      case AI_PROVIDER_CUSTOM:
        return {
          url: config.baseUrl || '',
          options: {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
            },
            body: JSON.stringify(completionBody),
          },
          parseText: (data) => this.pick(data, ['choices', 0, 'message', 'content']) ?? '',
        };
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }
  }

  private geminiGenerate(config: AIConnectionConfig, prompt: string): ProviderCall {
    const model = config.model || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`;
    return {
      url,
      options: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            ...(config.temperature != null ? { temperature: config.temperature } : {}),
            ...(config.maxTokens != null ? { maxOutputTokens: config.maxTokens } : {}),
          },
        }),
      },
      parseText: (data) => this.pick(data, ['candidates', 0, 'content', 'parts', 0, 'text']) ?? '',
    };
  }

  private buildHealthCall(config: AIConnectionConfig): { url: string; options: RequestInit } {
    switch (config.provider) {
      case AI_PROVIDER_GEMINI:
        return {
          url: `https://generativelanguage.googleapis.com/v1beta/models?key=${config.apiKey}`,
          options: { method: 'GET' },
        };
      case AI_PROVIDER_OPENROUTER:
        return {
          url: 'https://openrouter.ai/api/v1/models',
          options: { method: 'GET', headers: { Authorization: `Bearer ${config.apiKey}` } },
        };
      case AI_PROVIDER_OPENAI:
        return {
          url: 'https://api.openai.com/v1/models',
          options: { method: 'GET', headers: { Authorization: `Bearer ${config.apiKey}` } },
        };
      case AI_PROVIDER_OLLAMA:
        return {
          url: `${config.host || 'http://localhost:11434'}/api/tags`,
          options: { method: 'GET' },
        };
      case AI_PROVIDER_CUSTOM:
        return { url: config.baseUrl || '', options: { method: 'GET' } };
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }
  }

  private pick(data: unknown, keys: Array<string | number>): string | undefined {
    let cursor: unknown = data;
    for (const key of keys) {
      if (cursor && typeof cursor === 'object' && key in (cursor as Record<string | number, unknown>)) {
        cursor = (cursor as Record<string | number, unknown>)[key];
      } else {
        return undefined;
      }
    }
    return typeof cursor === 'string' ? cursor : undefined;
  }
}
