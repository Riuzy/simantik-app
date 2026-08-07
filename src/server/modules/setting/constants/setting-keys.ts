export const SETTING_KEYS = {
  // Application
  APP_NAME: 'app.name',
  APP_ORGANIZATION: 'app.organization',
  APP_LANGUAGE: 'app.language',
  APP_TIMEZONE: 'app.timezone',

  // Automation
  AUTOMATION_BROWSER: 'automation.browser',
  AUTOMATION_HEADLESS: 'automation.headless',
  AUTOMATION_TIMEOUT: 'automation.timeout',
  AUTOMATION_AUTO_GENERATE: 'automation.autoGenerate',
  AUTOMATION_AUTO_REPORT: 'automation.autoReport',
  AUTOMATION_SHOW_LOGS: 'automation.showLogs',

  // AI Integration
  AI_PROVIDER: 'ai.provider',
  AI_MODEL: 'ai.model',
  AI_API_KEY: 'ai.apiKey',
  AI_BASE_URL: 'ai.baseUrl',
  AI_TEMPERATURE: 'ai.temperature',
  AI_MAX_TOKENS: 'ai.maxTokens',

  // Notifications
  NOTIFICATIONS_EXECUTION_FINISHED: 'notifications.executionFinished',
  NOTIFICATIONS_EXECUTION_FAILED: 'notifications.executionFailed',
  NOTIFICATIONS_AI_GENERATION_FAILED: 'notifications.aiGenerationFailed',
  NOTIFICATIONS_DESKTOP: 'notifications.desktop',
  NOTIFICATIONS_EMAIL: 'notifications.email',

  // Appearance
  APPEARANCE_THEME: 'appearance.theme',
  APPEARANCE_SIDEBAR_STYLE: 'appearance.sidebarStyle',
  APPEARANCE_ACCENT_COLOR: 'appearance.accentColor',
  APPEARANCE_BORDER_RADIUS: 'appearance.borderRadius',
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

export const SETTING_KEY_LABELS: Record<SettingKey, string> = {
  [SETTING_KEYS.APP_NAME]: 'Application Name',
  [SETTING_KEYS.APP_ORGANIZATION]: 'Organization',
  [SETTING_KEYS.APP_LANGUAGE]: 'Default Language',
  [SETTING_KEYS.APP_TIMEZONE]: 'Timezone',
  [SETTING_KEYS.AUTOMATION_BROWSER]: 'Default Browser',
  [SETTING_KEYS.AUTOMATION_HEADLESS]: 'Default Execution Mode',
  [SETTING_KEYS.AUTOMATION_TIMEOUT]: 'Default Timeout',
  [SETTING_KEYS.AUTOMATION_AUTO_GENERATE]: 'Automatically Generate Script',
  [SETTING_KEYS.AUTOMATION_AUTO_REPORT]: 'Auto Save Reports',
  [SETTING_KEYS.AUTOMATION_SHOW_LOGS]: 'Show Execution Logs',
  [SETTING_KEYS.AI_PROVIDER]: 'AI Provider',
  [SETTING_KEYS.AI_MODEL]: 'AI Model',
  [SETTING_KEYS.AI_API_KEY]: 'AI API Key',
  [SETTING_KEYS.AI_BASE_URL]: 'AI Base URL',
  [SETTING_KEYS.AI_TEMPERATURE]: 'AI Temperature',
  [SETTING_KEYS.AI_MAX_TOKENS]: 'AI Max Tokens',
  [SETTING_KEYS.NOTIFICATIONS_EXECUTION_FINISHED]: 'Execution Finished',
  [SETTING_KEYS.NOTIFICATIONS_EXECUTION_FAILED]: 'Execution Failed',
  [SETTING_KEYS.NOTIFICATIONS_AI_GENERATION_FAILED]: 'AI Generation Failed',
  [SETTING_KEYS.NOTIFICATIONS_DESKTOP]: 'Desktop Notification',
  [SETTING_KEYS.NOTIFICATIONS_EMAIL]: 'Email Notification',
  [SETTING_KEYS.APPEARANCE_THEME]: 'Theme',
  [SETTING_KEYS.APPEARANCE_SIDEBAR_STYLE]: 'Sidebar Style',
  [SETTING_KEYS.APPEARANCE_ACCENT_COLOR]: 'Accent Color',
  [SETTING_KEYS.APPEARANCE_BORDER_RADIUS]: 'Border Radius',
};

export const SETTING_KEY_TYPES: Record<SettingKey, 'string' | 'boolean' | 'number'> = {
  [SETTING_KEYS.APP_NAME]: 'string',
  [SETTING_KEYS.APP_ORGANIZATION]: 'string',
  [SETTING_KEYS.APP_LANGUAGE]: 'string',
  [SETTING_KEYS.APP_TIMEZONE]: 'string',
  [SETTING_KEYS.AUTOMATION_BROWSER]: 'string',
  [SETTING_KEYS.AUTOMATION_HEADLESS]: 'boolean',
  [SETTING_KEYS.AUTOMATION_TIMEOUT]: 'number',
  [SETTING_KEYS.AUTOMATION_AUTO_GENERATE]: 'boolean',
  [SETTING_KEYS.AUTOMATION_AUTO_REPORT]: 'boolean',
  [SETTING_KEYS.AUTOMATION_SHOW_LOGS]: 'boolean',
  [SETTING_KEYS.AI_PROVIDER]: 'string',
  [SETTING_KEYS.AI_MODEL]: 'string',
  [SETTING_KEYS.AI_API_KEY]: 'string',
  [SETTING_KEYS.AI_BASE_URL]: 'string',
  [SETTING_KEYS.AI_TEMPERATURE]: 'number',
  [SETTING_KEYS.AI_MAX_TOKENS]: 'number',
  [SETTING_KEYS.NOTIFICATIONS_EXECUTION_FINISHED]: 'boolean',
  [SETTING_KEYS.NOTIFICATIONS_EXECUTION_FAILED]: 'boolean',
  [SETTING_KEYS.NOTIFICATIONS_AI_GENERATION_FAILED]: 'boolean',
  [SETTING_KEYS.NOTIFICATIONS_DESKTOP]: 'boolean',
  [SETTING_KEYS.NOTIFICATIONS_EMAIL]: 'boolean',
  [SETTING_KEYS.APPEARANCE_THEME]: 'string',
  [SETTING_KEYS.APPEARANCE_SIDEBAR_STYLE]: 'string',
  [SETTING_KEYS.APPEARANCE_ACCENT_COLOR]: 'string',
  [SETTING_KEYS.APPEARANCE_BORDER_RADIUS]: 'string',
};

export const SETTING_DEFAULTS: Record<SettingKey, unknown> = {
  [SETTING_KEYS.APP_NAME]: 'SIMANTIK',
  [SETTING_KEYS.APP_ORGANIZATION]: '',
  [SETTING_KEYS.APP_LANGUAGE]: 'en',
  [SETTING_KEYS.APP_TIMEZONE]: 'Asia/Jakarta',
  [SETTING_KEYS.AUTOMATION_BROWSER]: 'CHROMIUM',
  [SETTING_KEYS.AUTOMATION_HEADLESS]: true,
  [SETTING_KEYS.AUTOMATION_TIMEOUT]: 30000,
  [SETTING_KEYS.AUTOMATION_AUTO_GENERATE]: false,
  [SETTING_KEYS.AUTOMATION_AUTO_REPORT]: false,
  [SETTING_KEYS.AUTOMATION_SHOW_LOGS]: true,
  [SETTING_KEYS.AI_PROVIDER]: 'GEMINI',
  [SETTING_KEYS.AI_MODEL]: '',
  [SETTING_KEYS.AI_API_KEY]: '',
  [SETTING_KEYS.AI_BASE_URL]: '',
  [SETTING_KEYS.AI_TEMPERATURE]: 0.2,
  [SETTING_KEYS.AI_MAX_TOKENS]: 8192,
  [SETTING_KEYS.NOTIFICATIONS_EXECUTION_FINISHED]: true,
  [SETTING_KEYS.NOTIFICATIONS_EXECUTION_FAILED]: true,
  [SETTING_KEYS.NOTIFICATIONS_AI_GENERATION_FAILED]: false,
  [SETTING_KEYS.NOTIFICATIONS_DESKTOP]: false,
  [SETTING_KEYS.NOTIFICATIONS_EMAIL]: true,
  [SETTING_KEYS.APPEARANCE_THEME]: 'system',
  [SETTING_KEYS.APPEARANCE_SIDEBAR_STYLE]: 'normal',
  [SETTING_KEYS.APPEARANCE_ACCENT_COLOR]: 'blue',
  [SETTING_KEYS.APPEARANCE_BORDER_RADIUS]: 'md',
};

export const SETTING_OPTIONS: Record<SettingKey, Array<{ value: string; label: string }> | null> = {
  [SETTING_KEYS.APP_LANGUAGE]: [
    { value: 'en', label: 'English' },
    { value: 'id', label: 'Indonesian' },
  ],
  [SETTING_KEYS.APP_TIMEZONE]: [
    { value: 'Asia/Jakarta', label: 'Asia/Jakarta (WIB)' },
    { value: 'UTC', label: 'UTC' },
  ],
  [SETTING_KEYS.AUTOMATION_BROWSER]: [
    { value: 'CHROMIUM', label: 'Chromium' },
    { value: 'FIREFOX', label: 'Firefox' },
    { value: 'WEBKIT', label: 'WebKit' },
  ],
  [SETTING_KEYS.APPEARANCE_THEME]: [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ],
  [SETTING_KEYS.APPEARANCE_SIDEBAR_STYLE]: [
    { value: 'compact', label: 'Compact' },
    { value: 'normal', label: 'Normal' },
  ],
  [SETTING_KEYS.APPEARANCE_ACCENT_COLOR]: [
    { value: 'blue', label: 'Blue' },
    { value: 'violet', label: 'Violet' },
    { value: 'indigo', label: 'Indigo' },
    { value: 'cyan', label: 'Cyan' },
    { value: 'teal', label: 'Teal' },
    { value: 'green', label: 'Green' },
    { value: 'orange', label: 'Orange' },
    { value: 'red', label: 'Red' },
    { value: 'pink', label: 'Pink' },
  ],
  [SETTING_KEYS.APPEARANCE_BORDER_RADIUS]: [
    { value: 'none', label: 'None' },
    { value: 'sm', label: 'Small' },
    { value: 'md', label: 'Medium' },
    { value: 'lg', label: 'Large' },
  ],
  [SETTING_KEYS.APP_NAME]: null,
  [SETTING_KEYS.APP_ORGANIZATION]: null,
  [SETTING_KEYS.AUTOMATION_HEADLESS]: null,
  [SETTING_KEYS.AUTOMATION_TIMEOUT]: null,
  [SETTING_KEYS.AUTOMATION_AUTO_GENERATE]: null,
  [SETTING_KEYS.AUTOMATION_AUTO_REPORT]: null,
  [SETTING_KEYS.AUTOMATION_SHOW_LOGS]: null,
  [SETTING_KEYS.AI_PROVIDER]: null,
  [SETTING_KEYS.AI_MODEL]: null,
  [SETTING_KEYS.AI_API_KEY]: null,
  [SETTING_KEYS.AI_BASE_URL]: null,
  [SETTING_KEYS.AI_TEMPERATURE]: null,
  [SETTING_KEYS.AI_MAX_TOKENS]: null,
  [SETTING_KEYS.NOTIFICATIONS_EXECUTION_FINISHED]: null,
  [SETTING_KEYS.NOTIFICATIONS_EXECUTION_FAILED]: null,
  [SETTING_KEYS.NOTIFICATIONS_AI_GENERATION_FAILED]: null,
  [SETTING_KEYS.NOTIFICATIONS_DESKTOP]: null,
  [SETTING_KEYS.NOTIFICATIONS_EMAIL]: null,
};

export function isValidSettingKey(key: string): key is SettingKey {
  return Object.values(SETTING_KEYS).includes(key as SettingKey);
}

export function getSettingType(key: SettingKey): 'string' | 'boolean' | 'number' {
  return SETTING_KEY_TYPES[key] || 'string';
}

export function getSettingDefault(key: SettingKey): unknown {
  return SETTING_DEFAULTS[key];
}

export function getSettingOptions(key: SettingKey): Array<{ value: string; label: string }> | null {
  return SETTING_OPTIONS[key] || null;
}

export function getSettingLabel(key: SettingKey): string {
  return SETTING_KEY_LABELS[key] || key;
}
