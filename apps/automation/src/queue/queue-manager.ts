import type { ILogger } from '../core/interfaces';
import { AutomationQueue, type QueueStatistics, type QueueEventListener } from './automation-queue';
import type { AutomationJob } from '../core/domain';

export class QueueManager {
  private _queue: AutomationQueue;
  private _logger: ILogger;
  private _pollInterval: number;
  private _pollTimer: ReturnType<typeof setInterval> | null = null;

  constructor(queue: AutomationQueue, logger: ILogger, pollInterval = 1000) {
    this._queue = queue;
    this._logger = logger.child({ module: 'queue-manager' });
    this._pollInterval = pollInterval;
  }

  get queue(): AutomationQueue { return this._queue; }

  enqueueJob(job: AutomationJob): void {
    this._queue.enqueue(job);
    this._logger.debug({ jobId: job.id, queueLength: this._queue.length }, 'Job enqueued');
  }

  enqueueBatch(jobs: AutomationJob[]): void { for (const job of jobs) this.enqueueJob(job); }

  cancelJob(jobId: string): boolean {
    const result = this._queue.cancel(jobId);
    if (result) this._logger.info({ jobId }, 'Job cancelled from queue');
    return result;
  }

  getStatistics(): QueueStatistics { return this._queue.getStatistics(); }

  startPolling(onJobAvailable: (job: AutomationJob) => void): void {
    if (this._pollTimer) return;
    this._logger.info({ interval: this._pollInterval }, 'Queue polling started');
    this._pollTimer = setInterval(() => {
      if (this._queue.hasPending()) {
        const job = this._queue.claimNext();
        if (job) onJobAvailable(job);
      }
    }, this._pollInterval);
  }

  stopPolling(): void {
    if (this._pollTimer) { clearInterval(this._pollTimer); this._pollTimer = null; this._logger.info('Queue polling stopped'); }
  }

  onEvent(listener: QueueEventListener): void { this._queue.on(listener); }
  clear(): void { this._queue.clear(); }
}
