import { PrismaClient, Prisma } from '@prisma/client';

const PROMPT_SETTING_KEYS = {
  system: 'ai.prompt.system',
  scriptGenerator: 'ai.prompt.scriptGenerator',
  expectedResult: 'ai.prompt.expectedResult',
  testCase: 'ai.prompt.testCase',
  locatorGenerator: 'ai.prompt.locatorGenerator',
  executionAnalysis: 'ai.prompt.executionAnalysis',
} as const;

export class AIRepository {
  constructor(private prisma: PrismaClient) {}

  async getSetting() {
    return this.prisma.aISetting.findFirst({ orderBy: { updatedAt: 'desc' } });
  }

  async upsertSetting(data: {
    enabled: boolean;
    provider: string;
    apiKey: string | null;
    baseUrl: string | null;
    model: string | null;
    host: string | null;
  }) {
    const existing = await this.getSetting();
    if (!existing) {
      return this.prisma.aISetting.create({
        data: {
          enabled: data.enabled,
          provider: data.provider,
          apiKey: data.apiKey,
          baseUrl: data.baseUrl,
          model: data.model,
          host: data.host,
          apiKeyEncrypted: true,
        },
      });
    }
    return this.prisma.aISetting.update({
      where: { id: existing.id },
      data: {
        enabled: data.enabled,
        provider: data.provider,
        apiKey: data.apiKey,
        baseUrl: data.baseUrl,
        model: data.model,
        host: data.host,
        apiKeyEncrypted: true,
      },
    });
  }

  async getPromptTemplates() {
    const keys = Object.values(PROMPT_SETTING_KEYS);
    const rows = await this.prisma.setting.findMany({ where: { key: { in: keys } } });
    const map = new Map(rows.map((row) => [row.key, row.value]));
    return {
      system: typeof map.get(PROMPT_SETTING_KEYS.system) === 'string' ? map.get(PROMPT_SETTING_KEYS.system) : '',
      scriptGenerator: typeof map.get(PROMPT_SETTING_KEYS.scriptGenerator) === 'string' ? map.get(PROMPT_SETTING_KEYS.scriptGenerator) : '',
      expectedResult: typeof map.get(PROMPT_SETTING_KEYS.expectedResult) === 'string' ? map.get(PROMPT_SETTING_KEYS.expectedResult) : '',
      testCase: typeof map.get(PROMPT_SETTING_KEYS.testCase) === 'string' ? map.get(PROMPT_SETTING_KEYS.testCase) : '',
      locatorGenerator: typeof map.get(PROMPT_SETTING_KEYS.locatorGenerator) === 'string' ? map.get(PROMPT_SETTING_KEYS.locatorGenerator) : '',
      executionAnalysis: typeof map.get(PROMPT_SETTING_KEYS.executionAnalysis) === 'string' ? map.get(PROMPT_SETTING_KEYS.executionAnalysis) : '',
    } as Record<string, string>;
  }

  async upsertPromptTemplate(key: string, content: string) {
    const settingKey = PROMPT_SETTING_KEYS[key as keyof typeof PROMPT_SETTING_KEYS];
    if (!settingKey) throw new Error(`Unknown prompt template key: ${key}`);
    return this.prisma.setting.upsert({
      where: { key: settingKey },
      create: { key: settingKey, value: content as Prisma.InputJsonValue },
      update: { value: content as Prisma.InputJsonValue },
    });
  }
}
