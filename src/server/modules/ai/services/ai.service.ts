import { AIRepository } from '../repositories/ai.repository';
import { encryptSecret, decryptSecret } from '../../../utils/encryption';
import { getGenerator } from '../../automation/engines';
import { AIConnectionConfig } from '../../automation/engines/automation-generator';

function maskKey(plain: string | null): string | null {
  if (!plain) return null;
  if (plain.length <= 4) return '••••';
  return `••••••••${plain.slice(-4)}`;
}

export class AIService {
  constructor(private repository: AIRepository) {}

  async getSettings() {
    const setting = await this.repository.getSetting();
    const connection = await this.repository.getConnectionStatus();
    if (!setting) {
      return {
        id: null,
        enabled: false,
        provider: 'RULE_ENGINE',
        apiKey: null,
        apiKeyConfigured: false,
        baseUrl: null,
        model: null,
        host: null,
        temperature: null,
        maxTokens: null,
        connectionStatus: connection.status,
        connectionMessage: connection.message,
        connectionTestedAt: connection.testedAt,
        updatedAt: null,
      };
    }
    return {
      id: setting.id,
      enabled: setting.enabled,
      provider: setting.provider,
      apiKey: maskKey(decryptSecret(setting.apiKey)),
      apiKeyConfigured: !!setting.apiKey,
      baseUrl: setting.baseUrl,
      model: setting.model,
      host: setting.host,
      temperature: setting.temperature,
      maxTokens: setting.maxTokens,
      connectionStatus: connection.status,
      connectionMessage: connection.message,
      connectionTestedAt: connection.testedAt,
      updatedAt: setting.updatedAt,
    };
  }

  async saveSettings(dto: {
    enabled?: boolean;
    provider: string;
    apiKey?: string | null;
    baseUrl?: string | null;
    model?: string | null;
    host?: string | null;
    temperature?: number | null;
    maxTokens?: number | null;
  }) {
    const existing = await this.repository.getSetting();

    let apiKey = existing?.apiKey ?? null;
    if (dto.apiKey && dto.apiKey.trim()) {
      apiKey = encryptSecret(dto.apiKey.trim());
    } else if (dto.apiKey === '') {
      apiKey = null;
    }

    const saved = await this.repository.upsertSetting({
      enabled: dto.enabled ?? existing?.enabled ?? false,
      provider: dto.provider,
      apiKey,
      baseUrl: dto.baseUrl ?? existing?.baseUrl ?? null,
      model: dto.model ?? existing?.model ?? null,
      host: dto.host ?? existing?.host ?? null,
      temperature: dto.temperature ?? existing?.temperature ?? null,
      maxTokens: dto.maxTokens ?? existing?.maxTokens ?? null,
    });

    return {
      id: saved.id,
      enabled: saved.enabled,
      provider: saved.provider,
      apiKey: maskKey(decryptSecret(saved.apiKey)),
      apiKeyConfigured: !!saved.apiKey,
      baseUrl: saved.baseUrl,
      model: saved.model,
      host: saved.host,
      temperature: saved.temperature,
      maxTokens: saved.maxTokens,
      updatedAt: saved.updatedAt,
    };
  }

  async testConnection(dto: {
    provider: string;
    apiKey?: string | null;
    baseUrl?: string | null;
    model?: string | null;
    host?: string | null;
    temperature?: number | null;
    maxTokens?: number | null;
  }) {
    const existing = await this.repository.getSetting();
    const config: AIConnectionConfig = {
      provider: dto.provider.toUpperCase(),
      apiKey: dto.apiKey ?? decryptSecret(existing?.apiKey),
      baseUrl: dto.baseUrl ?? existing?.baseUrl ?? null,
      model: dto.model ?? existing?.model ?? null,
      host: dto.host ?? existing?.host ?? null,
      temperature: dto.temperature ?? existing?.temperature ?? null,
      maxTokens: dto.maxTokens ?? existing?.maxTokens ?? null,
    };

    const generator = getGenerator(config.provider);
    const result = await generator.testConnection(config);
    await this.repository.saveConnectionStatus(
      result.success ? 'connected' : 'failed',
      result.message,
    );
    return result;
  }

  async getPromptTemplates() {
    return this.repository.getPromptTemplates();
  }

  async updatePromptTemplate(key: string, content: string) {
    await this.repository.upsertPromptTemplate(key, content);
    return { key, content };
  }
}
