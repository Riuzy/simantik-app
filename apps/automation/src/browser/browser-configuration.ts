export interface BrowserConfiguration {
  browserType: 'chromium' | 'firefox' | 'webkit';
  headless: boolean;
  slowMo: number;
  viewport: { width: number; height: number } | null;
  userAgent: string | null;
  locale: string | null;
  timezoneId: string | null;
  permissions: string[];
  ignoreHttpsErrors: boolean;
  defaultTimeout: number;
  navigationTimeout: number;
}

export function createBrowserConfiguration(
  browserType: 'chromium' | 'firefox' | 'webkit',
  headless: boolean,
  slowMo: number,
  viewport: { width: number; height: number } | null,
  userAgent: string | null,
  locale: string | null,
  timezoneId: string | null,
  permissions: string[],
  ignoreHttpsErrors: boolean,
  defaultTimeout: number,
  navigationTimeout: number,
): BrowserConfiguration {
  return {
    browserType,
    headless,
    slowMo,
    viewport,
    userAgent,
    locale,
    timezoneId,
    permissions,
    ignoreHttpsErrors,
    defaultTimeout,
    navigationTimeout,
  };
}