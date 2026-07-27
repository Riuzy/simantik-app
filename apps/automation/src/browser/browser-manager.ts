import { chromium, firefox, webkit, type Browser, type BrowserContext, type BrowserType } from '@playwright/test';
import type { ILogger } from '../core/interfaces';
import type { BrowserConfiguration } from './browser-configuration';
import { RunnerException } from '../core/domain/exceptions';

export class BrowserManager {
  private _browser: Browser | null = null;
  private _context: BrowserContext | null = null;
  private _configuration: BrowserConfiguration;
  private _logger: ILogger;

  constructor(configuration: BrowserConfiguration, logger: ILogger) {
    this._configuration = configuration;
    this._logger = logger.child({ module: 'browser-manager' });
  }

  get browser(): Browser | null {
    return this._browser;
  }

  get context(): BrowserContext | null {
    return this._context;
  }

  get configuration(): BrowserConfiguration {
    return this._configuration;
  }

  private _selectBrowser(): BrowserType {
    switch (this._configuration.browserType) {
      case 'firefox': return firefox;
      case 'webkit': return webkit;
      default: return chromium;
    }
  }

  async launch(): Promise<void> {
    if (this._browser) {
      this._logger.warn('Browser already launched, closing first');
      await this.close();
    }

    const browserType = this._selectBrowser();
    this._logger.info({ browser: this._configuration.browserType, headless: this._configuration.headless }, 'Launching browser');

    try {
      this._browser = await browserType.launch({
        headless: this._configuration.headless,
        slowMo: this._configuration.slowMo,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      this._logger.info('Browser launched successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new RunnerException(message, 'PlaywrightRunner');
    }
  }

  async createContext(): Promise<BrowserContext> {
    if (!this._browser) {
      throw new RunnerException('Browser not launched. Call launch() first.', 'PlaywrightRunner');
    }

    this._logger.info('Creating browser context');
    try {
      this._context = await this._browser.newContext({
        viewport: this._configuration.viewport ?? undefined,
        userAgent: this._configuration.userAgent ?? undefined,
        locale: this._configuration.locale ?? undefined,
        timezoneId: this._configuration.timezoneId ?? undefined,
        permissions: this._configuration.permissions,
        ignoreHTTPSErrors: this._configuration.ignoreHttpsErrors,
      });
      return this._context;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new RunnerException(message, 'PlaywrightRunner');
    }
  }

  async close(): Promise<void> {
    if (this._context) {
      try {
        await this._context.close();
        this._logger.debug('Browser context closed');
      } catch (err) {
        this._logger.warn({ err }, 'Error closing browser context');
      }
      this._context = null;
    }

    if (this._browser) {
      try {
        await this._browser.close();
        this._logger.info('Browser closed');
      } catch (err) {
        this._logger.warn({ err }, 'Error closing browser');
      }
      this._browser = null;
    }
  }
}
