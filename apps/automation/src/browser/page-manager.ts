import type { Page, BrowserContext } from '@playwright/test';
import type { ILogger } from '../core/interfaces';
import type { BrowserConfiguration } from './browser-configuration';
import { RunnerException } from '../core/domain/exceptions';

export class PageManager {
  private _page: Page | null = null;
  private _configuration: BrowserConfiguration;
  private _logger: ILogger;

  constructor(configuration: BrowserConfiguration, logger: ILogger) {
    this._configuration = configuration;
    this._logger = logger.child({ module: 'page-manager' });
  }

  get page(): Page | null {
    return this._page;
  }

  async create(context: BrowserContext): Promise<Page> {
    this._logger.info('Creating new page');

    try {
      this._page = await context.newPage();
      this._page.setDefaultTimeout(this._configuration.defaultTimeout);
      this._logger.debug({ defaultTimeout: this._configuration.defaultTimeout }, 'Page created');
      return this._page;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new RunnerException(message, 'PlaywrightRunner');
    }
  }

  async navigate(url: string): Promise<void> {
    if (!this._page) {
      throw new RunnerException('Page not created. Call create() first.', 'PlaywrightRunner');
    }

    this._logger.info({ url }, 'Navigating to URL');
    try {
      await this._page.goto(url, {
        timeout: this._configuration.navigationTimeout,
        waitUntil: 'networkidle',
      });
      this._logger.info({ url }, 'Navigation completed');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new RunnerException(`Navigation failed: ${message}`, 'PlaywrightRunner');
    }
  }

  async close(): Promise<void> {
    if (this._page) {
      try {
        await this._page.close();
        this._logger.debug('Page closed');
      } catch (err) {
        this._logger.warn({ err }, 'Error closing page');
      }
      this._page = null;
    }
  }
}
