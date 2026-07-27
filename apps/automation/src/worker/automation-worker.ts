import type { ILogger, IExecutionManager } from '../core/interfaces';
import type { AutomationJob } from '../core/domain';
import { WorkerState } from '../queue/types';
import { JobScheduler } from './job-scheduler';
import { RetryPolicy } from './retry-policy';
import { TimeoutManager } from './timeout-manager';

export interface WorkerContext {
  id: string;
  startTime: Date;
  currentJobId: string | null;
}

export interface WorkerStatistics {
  workerId: string;
  state: WorkerState;
  startedAt: Date | null;
  completedJobs: number;
  failedJobs: number;
  currentJobId: string | null;
  uptimeMs: number;
}

export class AutomationWorker {
  readonly id: string;
  private _state: WorkerState = WorkerState.STOPPED;
  private _logger: ILogger;
  private _jobScheduler: JobScheduler;
  private _currentJobId: string | null = null;
  private _startTime: Date | null = null;
  private _completedJobs = 0;
  private _failedJobs = 0;

  constructor(
    id: string,
    logger: ILogger,
    executionManager: IExecutionManager,
    retryPolicy: RetryPolicy,
    timeoutManager: TimeoutManager,
  ) {
    this.id = id;
    this._logger = logger.child({ module: 'worker', workerId: id });
    this._jobScheduler = new JobScheduler(logger, executionManager, retryPolicy, timeoutManager);
  }

  get state(): WorkerState { return this._state; }
  get currentJobId(): string | null { return this._currentJobId; }

  async start(): Promise<void> {
    this._state = WorkerState.IDLE;
    this._startTime = new Date();
    this._logger.info('Worker started');
  }

  async pause(): Promise<void> {
    if (this._state === WorkerState.IDLE || this._state === WorkerState.WAITING) {
      this._state = WorkerState.PAUSED;
      this._logger.info('Worker paused');
    }
  }

  async resume(): Promise<void> {
    if (this._state === WorkerState.PAUSED) {
      this._state = WorkerState.IDLE;
      this._logger.info('Worker resumed');
    }
  }

  async stop(): Promise<void> {
    this._state = WorkerState.STOPPING;
    this._logger.info('Worker stopping');
    if (this._currentJobId) {
      this._jobScheduler.cancelJob(this._currentJobId);
    }
    this._state = WorkerState.STOPPED;
    this._logger.info('Worker stopped');
  }

  async executeJob(job: AutomationJob): Promise<void> {
    if (this._state === WorkerState.PAUSED || this._state === WorkerState.STOPPING) {
      this._logger.warn({ jobId: job.id }, 'Worker cannot accept jobs');
      return;
    }

    this._state = WorkerState.CLAIMING;
    this._currentJobId = job.id;

    this._logger.info({ jobId: job.id }, 'Worker claiming job');
    this._state = WorkerState.RUNNING;

    try {
      await this._jobScheduler.processJob(job);
      this._completedJobs++;
    } catch (err) {
      this._failedJobs++;
      this._logger.error({ jobId: job.id, err }, 'Worker job failed');
    } finally {
      this._currentJobId = null;
      this._state = WorkerState.IDLE;
    }
  }

  getStatistics(): WorkerStatistics {
    return {
      workerId: this.id,
      state: this._state,
      startedAt: this._startTime,
      completedJobs: this._completedJobs,
      failedJobs: this._failedJobs,
      currentJobId: this._currentJobId,
      uptimeMs: this._startTime ? Date.now() - this._startTime.getTime() : 0,
    };
  }
}
