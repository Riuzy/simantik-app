import type { ILogger } from '../core/interfaces';

export class TimeoutManager {
  private _executionTimeout: number;
  private _workerTimeout: number;
  private _browserTimeout: number;
  private _queueTimeout: number;
  private _logger: ILogger;
  private _timers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(config: {
    executionTimeout: number;
    workerTimeout: number;
    browserTimeout: number;
    queueTimeout: number;
  }, logger: ILogger) {
    this._executionTimeout = config.executionTimeout;
    this._workerTimeout = config.workerTimeout;
    this._browserTimeout = config.browserTimeout;
    this._queueTimeout = config.queueTimeout;
    this._logger = logger.child({ module: 'timeout-manager' });
  }

  get executionTimeout(): number { return this._executionTimeout; }
  get workerTimeout(): number { return this._workerTimeout; }
  get browserTimeout(): number { return this._browserTimeout; }
  get queueTimeout(): number { return this._queueTimeout; }

  startExecutionTimer(jobId: string, callback: () => void): void {
    this._clearTimer(jobId);
    this._logger.debug({ jobId, timeout: this._executionTimeout }, 'Starting execution timer');
    this._timers.set(jobId, setTimeout(() => {
      this._logger.warn({ jobId }, 'Execution timeout reached');
      callback();
    }, this._executionTimeout));
  }

  cancelExecutionTimer(jobId: string): void {
    this._clearTimer(jobId);
  }

  private _clearTimer(jobId: string): void {
    const timer = this._timers.get(jobId);
    if (timer) {
      clearTimeout(timer);
      this._timers.delete(jobId);
    }
  }

  clearAll(): void {
    for (const [id] of this._timers) {
      this._clearTimer(id);
    }
  }
}
