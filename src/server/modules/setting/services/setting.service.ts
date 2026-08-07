import { AppError } from '../../../middlewares/error-handler';
import { SettingRepository } from '../repositories/setting.repository';
import { SETTING_KEYS, SettingKey, isValidSettingKey, getSettingDefault, getSettingOptions, getSettingType } from '../constants/setting-keys';

interface TypedSettings {
  // Application
  [SETTING_KEYS.APP_NAME]: string;
  [SETTING_KEYS.APP_ORGANIZATION]: string;
  [SETTING_KEYS.APP_LANGUAGE]: string;
  [SETTING_KEYS.APP_TIMEZONE]: string;

  // Automation
  [SETTING_KEYS.AUTOMATION_BROWSER]: string;
  [SETTING_KEYS.AUTOMATION_HEADLESS]: boolean;
  [SETTING_KEYS.AUTOMATION_TIMEOUT]: number;
  [SETTING_KEYS.AUTOMATION_AUTO_GENERATE]: boolean;
  [SETTING_KEYS.AUTOMATION_AUTO_REPORT]: boolean;
  [SETTING_KEYS.AUTOMATION_SHOW_LOGS]: boolean;

  // AI Integration
  [SETTING_KEYS.AI_PROVIDER]: string;
  [SETTING_KEYS.AI_MODEL]: string;
  [SETTING_KEYS.AI_API_KEY]: string;
  [SETTING_KEYS.AI_BASE_URL]: string;
  [SETTING_KEYS.AI_TEMPERATURE]: number;
  [SETTING_KEYS.AI_MAX_TOKENS]: number;

  // Notifications
  [SETTING_KEYS.NOTIFICATIONS_EXECUTION_FINISHED]: boolean;
  [SETTING_KEYS.NOTIFICATIONS_EXECUTION_FAILED]: boolean;
  [SETTING_KEYS.NOTIFICATIONS_AI_GENERATION_FAILED]: boolean;
  [SETTING_KEYS.NOTIFICATIONS_DESKTOP]: boolean;
  [SETTING_KEYS.NOTIFICATIONS_EMAIL]: boolean;

  // Appearance
  [SETTING_KEYS.APPEARANCE_THEME]: string;
  [SETTING_KEYS.APPEARANCE_SIDEBAR_STYLE]: string;
  [SETTING_KEYS.APPEARANCE_ACCENT_COLOR]: string;
  [SETTING_KEYS.APPEARANCE_BORDER_RADIUS]: string;
}

export class SettingService {
  constructor(private repository: SettingRepository) {}

  async findAll() {
    const settings = await this.repository.findAll();
    return settings.map((s) => ({ key: s.key, value: s.value, updatedAt: s.updatedAt }));
  }

  async findByKey(key: string) {
    if (!isValidSettingKey(key)) {
      throw new AppError(404, 'Setting not found');
    }
    const setting = await this.repository.findByKey(key);
    if (!setting) {
      const defaultValue = getSettingDefault(key);
      return { key, value: defaultValue, updatedAt: null };
    }
    return { key: setting.key, value: setting.value, updatedAt: setting.updatedAt };
  }

  async findByKeys(keys: string[]) {
    const validKeys = keys.filter((k) => isValidSettingKey(k));
    const settings = await this.repository.findByKeys(validKeys as SettingKey[]);
    return settings.map((s) => ({ key: s.key, value: s.value, updatedAt: s.updatedAt }));
  }

  async getAllTyped(): Promise<TypedSettings> {
    const allSettings = await this.repository.getAllWithDefaults();
    return allSettings as unknown as TypedSettings;
  }

  async upsert(key: string, value: unknown) {
    if (!isValidSettingKey(key)) {
      throw new AppError(400, `Invalid setting key: ${key}`);
    }

    const expectedType = getSettingType(key);
    value = this.coerceValue(key, value, expectedType);
    this.validateAllowedValues(key, value);

    const setting = await this.repository.upsert(key, value);
    return { key: setting.key, value: setting.value, updatedAt: setting.updatedAt };
  }

  async bulkUpsert(settings: Record<string, unknown>) {
    const validSettings: Record<string, unknown> = {};
    for (const [key, rawValue] of Object.entries(settings)) {
      if (isValidSettingKey(key)) {
        const value = this.coerceValue(key, rawValue, getSettingType(key));
        this.validateAllowedValues(key, value);
        validSettings[key] = value;
      }
    }

    if (Object.keys(validSettings).length === 0) {
      return [];
    }

    const updated = await this.repository.bulkUpsert(validSettings as Record<SettingKey, unknown>);
    return updated.map((s) => ({ key: s.key, value: s.value, updatedAt: s.updatedAt }));
  }

  private validateAllowedValues(key: SettingKey, value: unknown) {
    const options = getSettingOptions(key);
    if (options && typeof value === 'string') {
      const allowed = options.some((o) => o.value === value);
      if (!allowed) {
        throw new AppError(400, `Invalid value for ${key}: ${value}`);
      }
    }
  }

  private coerceValue(key: SettingKey, value: unknown, expectedType: 'string' | 'boolean' | 'number'): unknown {
    if (value === null || value === undefined || value === '') {
      return getSettingDefault(key);
    }

    switch (expectedType) {
      case 'boolean':
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') return value === 'true' || value === '1';
        if (typeof value === 'number') return value !== 0;
        return Boolean(value);
      case 'number':
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
          const parsed = parseFloat(value);
          return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
      case 'string':
      default:
        return String(value);
    }
  }
}
