import type { ILogger } from '../core/interfaces';
import { ExecutionService } from './execution-service';

export interface HeartbeatData {
  workerId: string;
  status: string;
  currentJobId: string | null;
  cpuUsage?: number;
  memoryUsage?: number;
  version: string;
  lastActivity: Date;
}

export class HeartbeatManager {
  private _executionService: ExecutionService;
  private _logger: ILogger;
  private _interval: number;
  private _timer: ReturnType<typeof setInterval> | null = null;
  private _lastActivity: Date = new Date();
  private _version = '1.0.0';

  constructor(
    executionService: ExecutionService,
    logger: ILogger,
    interval: number = 15000,
  ) {
    this._executionService = executionService;
    this._logger = logger.child({ module: 'heartbeat' });
    this._interval = interval;
  }

  setLastActivity(): void { this._lastActivity = new Date(); }

  start(workerId: string): void {
    if (this._timer) return;
    this._logger.info({ interval: this._interval }, 'Heartbeat started');
    this._timer = setInterval(async () => {
      const data: HeartbeatData = {
        workerId,
        status: 'running',
        currentJobId: null,
        version: this._version,
        lastActivity: this._lastActivity,
      };
      try {
        await this._executionService.heartbeat(workerId, data.status, data.currentJobId);
      } catch (err) {
        this._logger.warn({ err }, 'Heartbeat failed');
      }
    }, this._interval);
  }

  stop(): void {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
      this._logger.info('Heartbeat stopped');
    }
  }

  getLastActivity(): Date { return this._lastActivity; }
}
