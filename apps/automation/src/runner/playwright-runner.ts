import { Runner } from './runner';
import type { IRunner, ILogger } from '../core/interfaces';
import type { AutomationJob, AutomationContext } from '../core/domain';
import { AutomationResult } from '../core/domain';
import { BrowserManager } from '../browser/browser-manager';
import { PageManager } from '../browser/page-manager';
import { BrowserConfiguration } from '../browser/browser-configuration';
import { RunnerException } from '../core/domain/exceptions';

export class PlaywrightRunner extends Runner implements IRunner {
  readonly name = 'playwright';

  private _browserManager: BrowserManager | null = null;
  private _pageManager: PageManager | null = null;
  private _browserConfig: BrowserConfiguration | null = null;

  constructor(
    logger: ILogger,
    browserConfig?: BrowserConfiguration,
  ) {
    super(logger);
    if (browserConfig) {
      this._browserConfig = browserConfig;
    }
  }

  canHandle(_job: AutomationJob): boolean {
    return true;
  }

  async initialize(): Promise<void> {
    this.logger.info('Playwright runner initializing');
    this._browserConfig = this._browserConfig ?? {
      browserType: 'chromium',
      headless: true,
      slowMo: 0,
      viewport: null,
      userAgent: null,
      locale: null,
      timezoneId: null,
      permissions: [],
      ignoreHttpsErrors: false,
      defaultTimeout: 30000,
      navigationTimeout: 30000,
    };
    this.logger.info({ browser: this._browserConfig.browserType }, 'Runner initialized');
  }

  async launch(job: AutomationJob): Promise<void> {
    if (!this._browserConfig) {
      throw new RunnerException('Runner not initialized. Call initialize() first.', this.name);
    }

    this.logger.info({ jobId: job.id, browser: job.browser }, 'Launching runner for job');

    const config: BrowserConfiguration = {
      ...this._browserConfig,
      browserType: job.browser as 'chromium' | 'firefox' | 'webkit',
    };

    const browserManager = new BrowserManager(config, this.logger);
    await browserManager.launch();
    const context = await browserManager.createContext();

    const pageManager = new PageManager(config, this.logger);
    await pageManager.create(context);

    if (job.baseUrl) {
      await pageManager.navigate(job.baseUrl);
    }

    this._browserManager = browserManager;
    this._pageManager = pageManager;
  }

  async execute(context: AutomationContext, result: AutomationResult): Promise<AutomationResult> {
    this.logger.info({ jobId: context.job.id }, 'Playwright runner executing');

    await this.initialize();
    await this.launch(context.job);

    result.succeed();
    return result;
  }

  async stop(): Promise<void> {
    this.logger.info('Stopping runner');
    if (this._pageManager) {
      await this._pageManager.close();
    }
    if (this._browserManager) {
      await this._browserManager.close();
    }
  }

  async cancel(jobId: string): Promise<void> {
    this.logger.info({ jobId }, 'Cancelling runner');
    await this.stop();
  }

  async cleanup(job: AutomationJob): Promise<void> {
    this.logger.info({ jobId: job.id }, 'Cleaning up runner resources');
    await this.stop();
  }

  async dispose(): Promise<void> {
    this.logger.info('Disposing runner');
    await this.stop();
    this._browserConfig = null;
  }
}
