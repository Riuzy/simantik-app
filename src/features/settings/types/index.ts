export interface Setting {
  key: string;
  value: unknown;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppSettings {
  // Application
  'app.name': string;
  'app.organization': string;
  'app.language': string;
  'app.timezone': string;

  // Automation
  'automation.browser': string;
  'automation.headless': boolean;
  'automation.timeout': number;
  'automation.autoGenerate': boolean;
  'automation.autoReport': boolean;
  'automation.showLogs': boolean;

  // AI Integration
  'ai.provider': string;
  'ai.model': string;
  'ai.apiKey': string;
  'ai.baseUrl': string;
  'ai.temperature': number;
  'ai.maxTokens': number;

  // Notifications
  'notifications.executionFinished': boolean;
  'notifications.executionFailed': boolean;
  'notifications.aiGenerationFailed': boolean;
  'notifications.desktop': boolean;
  'notifications.email': boolean;

  // Appearance
  'appearance.theme': string;
  'appearance.sidebarStyle': string;
  'appearance.accentColor': string;
  'appearance.borderRadius': string;
}

export type SettingKey = keyof AppSettings;

export interface SettingDefinition {
  key: SettingKey;
  label: string;
  type: 'string' | 'boolean' | 'number';
  defaultValue: unknown;
  options?: Array<{ value: string; label: string }>;
  section: 'application' | 'automation' | 'ai' | 'notifications' | 'appearance';
}