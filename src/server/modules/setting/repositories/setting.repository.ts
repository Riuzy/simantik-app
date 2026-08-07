import { PrismaClient, Prisma } from '@prisma/client';
import { SETTING_KEYS, SETTING_DEFAULTS, SettingKey, isValidSettingKey } from '../constants/setting-keys';

const ALL_KEYS = Object.values(SETTING_KEYS) as string[];

export class SettingRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll() {
    return this.prisma.setting.findMany({
      where: {
        key: { in: Object.values(SETTING_KEYS) },
      },
      orderBy: { key: 'asc' },
    });
  }

  async findByKey(key: string) {
    if (!isValidSettingKey(key)) {
      return null;
    }
    return this.prisma.setting.findUnique({ where: { key } });
  }

  async findByKeys(keys: SettingKey[]) {
    return this.prisma.setting.findMany({
      where: { key: { in: keys } },
    });
  }

  async upsert(key: SettingKey, value: unknown) {
    if (!isValidSettingKey(key)) {
      throw new Error(`Invalid setting key: ${key}`);
    }
    return this.prisma.setting.upsert({
      where: { key },
      create: { key, value: value as Prisma.InputJsonValue },
      update: { value: value as Prisma.InputJsonValue },
    });
  }

  async bulkUpsert(settings: Record<SettingKey, unknown>) {
    const validSettings: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(settings)) {
      if (ALL_KEYS.includes(key)) {
        validSettings[key] = value;
      }
    }

    if (Object.keys(validSettings).length === 0) {
      return [];
    }

    return this.prisma.$transaction(
      Object.entries(validSettings).map(([key, value]) =>
        this.prisma.setting.upsert({
          where: { key },
          create: { key, value: value as Prisma.InputJsonValue },
          update: { value: value as Prisma.InputJsonValue },
        }),
      ),
    );
  }

  async initializeDefaults() {
    const existing = await this.prisma.setting.findMany({
      where: { key: { in: Object.values(SETTING_KEYS) } },
    });
    const existingKeys = new Set(existing.map((s) => s.key));
    const toCreate = Object.entries(SETTING_DEFAULTS)
      .filter(([key]) => !existingKeys.has(key))
      .map(([key, value]) => ({
        key,
        value: value as Prisma.InputJsonValue,
      }));

    if (toCreate.length > 0) {
      await this.prisma.setting.createMany({ data: toCreate, skipDuplicates: true });
    }
  }

  async getAllWithDefaults(): Promise<Record<string, unknown>> {
    await this.initializeDefaults();
    const settings = await this.findAll();
    const result: Record<string, unknown> = { ...SETTING_DEFAULTS };
    for (const setting of settings) {
      if (isValidSettingKey(setting.key)) {
        result[setting.key] = setting.value;
      }
    }
    return result;
  }
}