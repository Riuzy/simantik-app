import { logger } from '../../../lib/logger';
import { AIProviderError } from '../../../lib/errors';
import {
  AutomationGenerator,
  AIConnectionConfig,
  GeneratedScript,
  GeneratorContext,
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

interface ProviderErrorInfo {
  statusCode: number;
  message: string;
  providerMessage?: string;
  details?: string;
}

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_DEFAULT_MODEL = 'gemini-3.1-flash-lite';
const GEMINI_HEALTH_MODEL = 'gemini-3.1-flash-lite';

function isDevelopment(): boolean {
  return process.env.NODE_ENV !== 'production';
}

function stripCodeFences(text: string): string {
  const cleaned = text.trim();
  const fenced = cleaned.match(/```(?:[a-zA-Z]+)?\s*([\s\S]*?)```/);
  return (fenced ? fenced[1] : cleaned).trim();
}

function defaultSystemPrompt(): string {
  return [
    'You are an experienced QA Automation Engineer.',
    'You produce complete, correct, and runnable Playwright scripts.',
    'Use stable and self-healing locators.',
    'Do not add unnecessary comments.',
    'CRITICAL: NEVER invent or hardcode any URL, domain, or hostname.',
    'CRITICAL: Use ONLY the Base URL provided in the Project Context.',
    'CRITICAL: All navigation must use the Base URL variable (BASE_URL).',
  ].join('\n');
}

function defaultScriptPromptTemplate(): string {
  return [
    'Generate a Playwright automation script for the following test case.',
    '',
    '=== PROJECT CONTEXT ===',
    '{projectContext}',
    '',
    '=== TEST CASE ===',
    'Test Case: {title}',
    'Code: {code}',
    'Framework: {framework}',
    '',
    'Test Steps:',
    '{steps}',
    '',
    '=== CRITICAL RULES ===',
    '- Output ONLY the raw script (plain Node.js + Playwright), no markdown fences, no explanations.',
    '- Use `const { chromium } = require(\'playwright\');`.',
    '- IMMEDIATELY after the opening async function, define URL constants:',
    '  const BASE_URL = "{baseUrl}";',
    '  const LOGIN_URL = "{loginUrl}";',
    '- NEVER invent or hardcode any URL or domain.',
    '- NEVER write URLs like "http://localhost:3000" or "https://simantik.local" directly in goto() calls.',
    '- For ALL navigation, use the BASE_URL or LOGIN_URL constants.',
    '- Example navigation: await page.goto(LOGIN_URL); or await page.goto(`${BASE_URL}/dashboard`);',
    '- If using a __goto helper, pass the constant: await __goto(page, LOGIN_URL, 30000);',
    '- Log progress via console.log with the prefix `LOG:LEVEL:message` (e.g. `LOG:INFO:...`).',
    '- At the end, output `RESULT:{"status":"PASSED"|"FAILED","error":"..."}` as a JSON string.',
    '- Wrap every step in try/catch. Number each step.',
    '- Verify each step against its Expected Result.',
  ].join('\n');
}

export class AIGenerator implements AutomationGenerator {
  readonly key = 'AI';

  constructor(private readonly provider: AIProvider) {}

  async generate(context: GeneratorContext): Promise<GeneratedScript> {
    if (!context.options.baseUrl) {
      throw new AIProviderError(400, 'Project Base URL has not been configured.', 'Missing Base URL', 'The project must have a Base URL configured before AI can generate scripts.');
    }

    const projectContext = this.buildProjectContext(context);
    const system = context.systemPrompt || defaultSystemPrompt();
    const template = context.scriptPromptTemplate || defaultScriptPromptTemplate();
    const prompt = template
      .replaceAll('{projectContext}', projectContext)
      .replaceAll('{baseUrl}', context.options.baseUrl)
      .replaceAll('{loginUrl}', context.options.baseUrl + (context.projectLoginUrl?.replace(context.options.baseUrl, '') || ''))
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

    const resolved = this.withDefaults(config);

    if (isDevelopment()) {
      console.log(`[AI:${resolved.provider}] Generating script`, {
        provider: resolved.provider,
        model: resolved.model,
        projectBaseUrl: context.options.baseUrl,
        prompt: prompt.slice(0, 500),
      });
    }

    const content = await this.callModel(resolved, system, prompt);

    if (isDevelopment()) {
      console.log(`[AI:${resolved.provider}] Generation complete`, {
        provider: resolved.provider,
        model: resolved.model,
        responsePreview: content.slice(0, 300),
      });
    }

    const processedContent = this.injectBaseURLConstants(stripCodeFences(content), context.options.baseUrl, context.projectLoginUrl);

    return {
      script: processedContent,
      generatorType: 'AI',
      provider: resolved.provider,
      model: resolved.model,
    };
  }

  async testConnection(config: AIConnectionConfig): Promise<TestConnectionResult> {
    const resolved = this.withDefaults(config);

    if (isDevelopment()) {
      console.log(`[AI:${resolved.provider}] Testing connection`, {
        provider: resolved.provider,
        model: resolved.model,
        endpoint: resolved.provider === AI_PROVIDER_GEMINI
          ? `${GEMINI_BASE_URL}/models/${resolved.model ?? GEMINI_HEALTH_MODEL}:generateContent`
          : (resolved.baseUrl ?? resolved.host ?? '(default)'),
      });
    }

    try {
      this.validateConfig(resolved);
      const call = this.buildHealthCall(resolved);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);

      let res: Response;
      let bodyText = '';
      try {
        res = await fetch(call.url, call.options);
        bodyText = await res.text();
      } catch (error) {
        clearTimeout(timer);
        const detail = this.errorDetail(error);
        throw new AIProviderError(502, `Network error contacting ${AI_PROVIDER_LABELS[this.provider]}`, detail, `Request failed before a response was received. ${detail}`);
      } finally {
        clearTimeout(timer);
      }

      this.logProviderResponse(resolved, res.status, bodyText);

      if (!res.ok) {
        const info = this.parseProviderError(resolved, res.status, bodyText);
        return { success: false, message: info.message };
      }

      return { success: true, message: 'Connected successfully.' };
    } catch (error) {
      const info = this.toErrorInfo(error);
      logger.error({ err: error, provider: this.provider }, 'AI connection test failed');
      if (isDevelopment()) {
          console.log(`[AI:${this.provider}] Connection test failed`, info);
      }
      return { success: false, message: info.message };
    }
  }

  private withDefaults(config: AIConnectionConfig): AIConnectionConfig {
    if (this.provider === AI_PROVIDER_GEMINI) {
      return {
        ...config,
        provider: AI_PROVIDER_GEMINI,
        model: config.model || GEMINI_DEFAULT_MODEL,
      };
    }
    return config;
  }

  private validateConfig(config: AIConnectionConfig): void {
    if (!config.provider || !AI_PROVIDERS.includes(config.provider as AIProvider)) {
      throw new AIProviderError(400, `Unsupported provider: ${config.provider}`, 'Invalid provider', 'Choose a supported AI provider.');
    }

    if (config.provider === AI_PROVIDER_OLLAMA) {
      return;
    }

    if (!config.apiKey || config.apiKey.trim().length === 0) {
      throw new AIProviderError(400, 'API Key is required', 'Missing API Key', 'Provide a valid API Key for this provider.');
    }

    if (!config.model || config.model.trim().length === 0) {
      throw new AIProviderError(400, 'Model is required', 'Missing model', 'Select a model for this provider.');
    }
  }

  private validatePrompt(prompt: string): void {
    if (!prompt || prompt.trim().length === 0) {
      throw new AIProviderError(400, 'Prompt is empty', 'Empty prompt', 'The generated prompt was empty, so the AI provider was not called.');
    }
  }

  private async callModel(config: AIConnectionConfig, system: string, prompt: string): Promise<string> {
    this.validateConfig(config);
    this.validatePrompt(prompt);

    const call = this.buildGenerateCall(config, system, prompt);
    this.logProviderRequest(config, call.url, call.options);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 120000);

    let res: Response;
    let bodyText = '';
    try {
      res = await fetch(call.url, call.options);
      bodyText = await res.text();
    } catch (error) {
      clearTimeout(timer);
      const detail = this.errorDetail(error);
      const message = error instanceof Error && error.name === 'AbortError'
        ? 'Request timed out after 120s'
        : `Network error contacting ${AI_PROVIDER_LABELS[this.provider]}`;
      logger.error({ err: error, provider: config.provider, model: config.model, url: call.url }, 'AI generate network failure');
      if (isDevelopment()) {
          console.error(`[AI:${config.provider}] Request failed`, { error, provider: config.provider, model: config.model });
      }
      throw new AIProviderError(502, message, detail, `Request failed before a response was received. ${detail}`);
    } finally {
      clearTimeout(timer);
    }

    this.logProviderResponse(config, res.status, bodyText);

    if (!res.ok) {
      const info = this.parseProviderError(config, res.status, bodyText);
      throw new AIProviderError(info.statusCode, info.message, info.providerMessage, info.details);
    }

    let data: unknown;
    try {
      data = JSON.parse(bodyText);
    } catch {
      throw new AIProviderError(502, `${AI_PROVIDER_LABELS[this.provider]} returned an invalid response`, 'Invalid JSON response', bodyText.slice(0, 500));
    }

    const text = call.parseText(data);
    if (!text) throw new AIProviderError(502, `${AI_PROVIDER_LABELS[this.provider]} returned an empty response`, 'Empty response', bodyText.slice(0, 500));

    return text;
  }

  /**
   * Maps an upstream HTTP status + body into a human-readable error.
   * Gemini errors carry a structured `error.message` that we surface as-is.
   */
  private parseProviderError(config: AIConnectionConfig, statusCode: number, bodyText: string): ProviderErrorInfo {
    let providerMessage: string | undefined;
    let details: string | undefined;

    try {
      const parsed = JSON.parse(bodyText) as { error?: { message?: string; status?: string } };
      if (parsed.error) {
        providerMessage = parsed.error.message;
        details = bodyText.slice(0, 500);
      }
    } catch {
      details = bodyText.slice(0, 500);
    }

    const label = AI_PROVIDER_LABELS[this.provider] ?? this.provider;

    const statusMessages: Record<number, string> = {
      400: `${label} returned 400 (Bad Request)`,
      401: `${label} returned 401 (Unauthorized). Check your API Key.`,
      403: `${label} returned 403 (Forbidden). Check your API Key permissions.`,
      404: `${label} returned 404 (Not Found). The model may not exist.`,
      429: `${label} returned 429 (Quota exceeded). Check your usage limits.`,
      500: `${label} returned 500 (Internal Server Error).`,
    };

    const message = providerMessage ?? statusMessages[statusCode] ?? `${label} returned ${statusCode}.`;
    const error = providerMessage
      ? providerMessage
      : `${label} API returned HTTP ${statusCode}`;

    return { statusCode, message, providerMessage: error, details };
  }

  private logProviderRequest(config: AIConnectionConfig, url: string, options: RequestInit): void {
    const safeBody = this.redactRequestBody(options.body);
    logger.info({ provider: config.provider, model: config.model, url }, 'AI request');
    if (isDevelopment()) {
      console.log(`[AI:${config.provider}] Request`, {
        provider: config.provider,
        model: config.model,
        endpoint: url,
        payload: safeBody,
      });
    }
  }

  private logProviderResponse(config: AIConnectionConfig, statusCode: number, bodyText: string): void {
    logger.info({ provider: config.provider, model: config.model, statusCode }, 'AI response');
    if (isDevelopment()) {
      console.log(`[AI:${config.provider}] Response`, {
        provider: config.provider,
        model: config.model,
        statusCode,
        response: bodyText.slice(0, 2000),
      });
    }
  }

  private redactRequestBody(body: unknown): unknown {
    if (typeof body !== 'string') return body;
    try {
      const parsed = JSON.parse(body) as Record<string, unknown>;
      return {
        ...parsed,
        contents: '[REDACTED for logging]',
      };
    } catch {
      return '[REDACTED]';
    }
  }

  private errorDetail(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
  }

  private toErrorInfo(error: unknown): ProviderErrorInfo {
    if (error instanceof AIProviderError) {
      return {
        statusCode: error.statusCode,
        message: error.message,
        providerMessage: error.providerMessage,
        details: error.details,
      };
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { statusCode: 500, message, providerMessage: message };
  }

  private buildProjectContext(context: GeneratorContext): string {
    const lines = [
      `Project: ${context.projectName || 'Unknown'}`,
      `Base URL: ${context.options.baseUrl || 'NOT CONFIGURED'}`,
      context.projectLoginUrl ? `Login URL: ${context.projectLoginUrl}` : '',
      context.projectEnvironment ? `Environment: ${context.projectEnvironment}` : '',
      `Browser: ${context.options.browser}`,
      `Viewport: ${context.options.viewportWidth}x${context.options.viewportHeight}`,
      `Headless: ${context.options.headless}`,
      `Timeout: ${context.options.timeout}ms`,
      `Framework: ${context.framework}`,
    ].filter(line => line.length > 0);
    return lines.join('\n');
  }

  private injectBaseURLConstants(script: string, baseUrl: string, loginUrl?: string): string {
    const baseUrlLine = `  const BASE_URL = "${baseUrl}";`;
    const loginUrlLine = `  const LOGIN_URL = "${loginUrl || baseUrl + '/login'}";`;
    
    if (script.includes('const BASE_URL')) {
      return script;
    }

    const asyncMatch = script.match(/\(async\s*\(\s*\)\s*=>\s*\{/);
    if (!asyncMatch) {
      if (isDevelopment()) {
        console.log('[AI] No async match found, returning script as-is');
      }
      return script;
    }

    if (isDevelopment()) {
      console.log('[AI] Injecting BASE_URL constants at position', script.indexOf(asyncMatch[0]) + asyncMatch[0].length);
    }

    const insertPoint = script.indexOf(asyncMatch[0]) + asyncMatch[0].length;
    const beforeInsert = script.substring(0, insertPoint);
    const afterInsert = script.substring(insertPoint);

    const result = beforeInsert + '\n' + baseUrlLine + '\n' + loginUrlLine + afterInsert;
    
    if (isDevelopment()) {
      console.log('[AI] Injection result preview:', result.substring(0, 300));
    }
    
    return result;
  }

  private serializeSteps(steps: GeneratorContext['steps']): string {
    return steps
      .map((step) => {
        const parts = [`${step.stepNumber}. ${step.action}`];
        if (step.locatorValue) parts.push(`   locator: ${step.locatorStrategy}="${step.locatorValue}"`);
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
        return this.geminiGenerate(config, prompt, system);
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
        throw new AIProviderError(400, `Unsupported provider: ${config.provider}`, 'Invalid provider', 'Choose a supported AI provider.');
    }
  }

  private geminiGenerate(config: AIConnectionConfig, prompt: string, system: string): ProviderCall {
    const model = config.model || GEMINI_DEFAULT_MODEL;
    const url = `${GEMINI_BASE_URL}/models/${model}:generateContent`;
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      ...(system
        ? { systemInstruction: { parts: [{ text: system }] } }
        : {}),
      generationConfig: {
        ...(config.temperature != null ? { temperature: config.temperature } : {}),
        ...(config.maxTokens != null ? { maxOutputTokens: config.maxTokens } : {}),
      },
    };

    return {
      url,
      options: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': config.apiKey ?? '' },
        body: JSON.stringify(body),
      },
      parseText: (data) => this.pick(data, ['candidates', 0, 'content', 'parts', 0, 'text']) ?? '',
    };
  }

  private buildHealthCall(config: AIConnectionConfig): { url: string; options: RequestInit } {
    switch (config.provider) {
      case AI_PROVIDER_GEMINI:
        return {
          url: `${GEMINI_BASE_URL}/models/${config.model || GEMINI_HEALTH_MODEL}:generateContent`,
          options: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': config.apiKey ?? '' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Reply with the single word: ok' }] }],
              generationConfig: { maxOutputTokens: 5 },
            }),
          },
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
        throw new AIProviderError(400, `Unsupported provider: ${config.provider}`, 'Invalid provider', 'Choose a supported AI provider.');
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
