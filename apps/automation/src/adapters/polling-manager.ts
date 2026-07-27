import type { ILogger } from '../core/interfaces';
import type { BrowserType } from '../core/domain';
import { AutomationJob } from '../core/domain';
import { ExecutionService } from './execution-service';

export class PollingManager {
  private _executionService: ExecutionService;
  private _logger: ILogger;
  private _pollInterval: number;
  private _pollTimer: ReturnType<typeof setInterval> | null = null;
  private _isPolling = false;
  private _backoffCount = 0;
  private _maxBackoff: number;
  private _pauseRequested = false;

  constructor(
    executionService: ExecutionService,
    logger: ILogger,
    pollInterval: number,
    maxBackoff: number = 30000,
  ) {
    this._executionService = executionService;
    this._logger = logger.child({ module: 'polling-manager' });
    this._pollInterval = pollInterval;
    this._maxBackoff = maxBackoff;
  }

  start(onJobAvailable: (job: AutomationJob) => void): void {
    if (this._pollTimer) return;
    this._logger.info({ interval: this._pollInterval }, 'Polling started');
    this._pollTimer = setInterval(async () => {
      if (this._isPolling || this._pauseRequested) return;
      this._isPolling = true;
      try {
        const raw = await this._executionService.claimJob();
        if (raw) {
          this._backoffCount = 0;
          const job = this._mapToJob(raw);
          onJobAvailable(job);
        } else {
          this._backoffCount = Math.max(0, this._backoffCount - 1);
        }
      } catch (err) {
        this._backoffCount++;
        this._logger.warn({ backoff: this._backoffCount, err }, 'Polling error');
        if (this._backoffCount > 5) {
          const delay = Math.min(this._pollInterval * Math.pow(2, this._backoffCount - 5), this._maxBackoff);
          this._logger.info({ delay }, 'Backing off polling');
          this.stop();
          setTimeout(() => this.start(onJobAvailable), delay);
        }
      } finally {
        this._isPolling = false;
      }
    }, this._pollInterval);
  }

  stop(): void {
    if (this._pollTimer) {
      clearInterval(this._pollTimer);
      this._pollTimer = null;
      this._logger.info('Polling stopped');
    }
  }

  pause(): void { this._pauseRequested = true; }
  resume(): void { this._pauseRequested = false; }

  private _mapToJob(raw: Record<string, unknown>): AutomationJob {
    return new AutomationJob(
      raw.id as string,
      raw.executionId as string || raw.id as string,
      raw.projectId as string,
      raw.testRunId as string,
      (raw.environment as string) || '',
      raw.browser as BrowserType || 'chromium' as BrowserType,
      raw.baseUrl as string,
      (raw.variables as Record<string, string>) || {},
      (raw.headless as boolean) ?? true,
      raw.createdAt ? new Date(raw.createdAt as string) : new Date(),
    );
  }
}
