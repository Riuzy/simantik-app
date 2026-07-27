import type { ILogger, IExecutionManager } from '../core/interfaces';
import type { AutomationJob } from '../core/domain';
import { QueueManager } from '../queue/queue-manager';
import { AutomationWorker, type WorkerStatistics } from './automation-worker';
import { RetryPolicy } from './retry-policy';
import { TimeoutManager } from './timeout-manager';

export class WorkerManager {
  private _workers: AutomationWorker[] = [];
  private _logger: ILogger;
  private _queueManager: QueueManager;
  private _executionManager: IExecutionManager;
  private _retryPolicy: RetryPolicy;
  private _timeoutManager: TimeoutManager;
  private _workerCount: number;
  private _workerIndex = 0;

  constructor(
    config: {
      workerCount: number;
      pollInterval: number;
    },
    logger: ILogger,
    queueManager: QueueManager,
    executionManager: IExecutionManager,
    retryPolicy: RetryPolicy,
    timeoutManager: TimeoutManager,
  ) {
    this._logger = logger.child({ module: 'worker-manager' });
    this._queueManager = queueManager;
    this._executionManager = executionManager;
    this._retryPolicy = retryPolicy;
    this._timeoutManager = timeoutManager;
    this._workerCount = config.workerCount;
  }

  async initialize(): Promise<void> {
    this._logger.info({ count: this._workerCount }, 'Initializing workers');
    for (let i = 0; i < this._workerCount; i++) {
      const worker = new AutomationWorker(
        `worker-${i + 1}`,
        this._logger,
        this._executionManager,
        this._retryPolicy,
        this._timeoutManager,
      );
      await worker.start();
      this._workers.push(worker);
    }
    this._logger.info({ count: this._workers.length }, 'Workers initialized');

    this._queueManager.startPolling((job) => {
      this._dispatchJob(job);
    });
  }

  private _dispatchJob(job: AutomationJob): void {
    const availableWorker = this._getAvailableWorker();
    if (!availableWorker) {
      this._logger.warn({ jobId: job.id }, 'No available worker, returning job to queue');
      this._queueManager.enqueueJob(job);
      return;
    }
    availableWorker.executeJob(job).catch(err => {
      this._logger.error({ jobId: job.id, err }, 'Worker job execution failed');
    });
  }

  private _getAvailableWorker(): AutomationWorker | null {
    for (let i = 0; i < this._workers.length; i++) {
      const index = (this._workerIndex + i) % this._workers.length;
      const worker = this._workers[index];
      if (worker.state === 'IDLE' || worker.state === 'WAITING') {
        this._workerIndex = (index + 1) % this._workers.length;
        return worker;
      }
    }
    return null;
  }

  async shutdown(): Promise<void> {
    this._logger.info('Shutting down workers');
    this._queueManager.stopPolling();
    await Promise.all(this._workers.map(w => w.stop()));
    this._workers = [];
    this._logger.info('All workers stopped');
  }

  getWorkerStatistics(): WorkerStatistics[] {
    return this._workers.map(w => w.getStatistics());
  }

  pauseAll(): void {
    for (const worker of this._workers) {
      worker.pause();
    }
  }

  resumeAll(): void {
    for (const worker of this._workers) {
      worker.resume();
    }
  }
}
