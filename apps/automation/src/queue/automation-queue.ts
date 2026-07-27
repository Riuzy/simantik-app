import type { AutomationJob } from '../core/domain';
import { QueueEventType } from './types';

export interface QueueItem {
  job: AutomationJob;
  enqueuedAt: Date;
  claimedAt: Date | null;
  completedAt: Date | null;
  retryCount: number;
}

export interface QueueStatistics {
  totalEnqueued: number;
  totalClaimed: number;
  totalCompleted: number;
  totalFailed: number;
  totalCancelled: number;
  totalTimeout: number;
  currentLength: number;
  averageWaitTime: number;
  averageProcessingTime: number;
}

export type QueueEventListener = (event: QueueEventType, jobId: string) => void;

export class AutomationQueue {
  private _items: QueueItem[] = [];
  private _totalEnqueued = 0;
  private _totalClaimed = 0;
  private _totalCompleted = 0;
  private _totalFailed = 0;
  private _totalCancelled = 0;
  private _totalTimeout = 0;
  private _listeners: QueueEventListener[] = [];

  get length(): number { return this._items.length; }
  get all(): ReadonlyArray<QueueItem> { return this._items; }

  on(listener: QueueEventListener): void { this._listeners.push(listener); }
  off(listener: QueueEventListener): void { this._listeners = this._listeners.filter(l => l !== listener); }

  private _emit(event: QueueEventType, jobId: string): void {
    for (const listener of this._listeners) listener(event, jobId);
  }

  enqueue(job: AutomationJob): void {
    this._items.push({ job, enqueuedAt: new Date(), claimedAt: null, completedAt: null, retryCount: 0 });
    this._totalEnqueued++;
    this._emit(QueueEventType.ENQUEUED, job.id);
  }

  enqueueBatch(jobs: AutomationJob[]): void { for (const job of jobs) this.enqueue(job); }

  claimNext(): AutomationJob | null {
    const index = this._items.findIndex(item => item.claimedAt === null);
    if (index === -1) return null;
    const item = this._items[index];
    item.claimedAt = new Date();
    this._totalClaimed++;
    this._emit(QueueEventType.CLAIMED, item.job.id);
    return item.job;
  }

  complete(jobId: string): boolean {
    const item = this._items.find(i => i.job.id === jobId);
    if (!item) return false;
    item.completedAt = new Date();
    this._items = this._items.filter(i => i.job.id !== jobId);
    this._totalCompleted++;
    this._emit(QueueEventType.COMPLETED, jobId);
    return true;
  }

  fail(jobId: string, retry: boolean): boolean {
    const item = this._items.find(i => i.job.id === jobId);
    if (!item) return false;
    if (retry) { item.retryCount++; item.claimedAt = null; this._emit(QueueEventType.FAILED, jobId); return true; }
    this._items = this._items.filter(i => i.job.id !== jobId);
    this._totalFailed++;
    this._emit(QueueEventType.FAILED, jobId);
    return true;
  }

  cancel(jobId: string): boolean {
    const removed = this._items.filter(i => i.job.id !== jobId);
    if (removed.length === this._items.length) return false;
    this._items = removed;
    this._totalCancelled++;
    this._emit(QueueEventType.CANCELLED, jobId);
    return true;
  }

  cancelAll(): void { for (const item of this._items) this.cancel(item.job.id); }

  find(jobId: string): QueueItem | undefined { return this._items.find(i => i.job.id === jobId); }
  hasPending(): boolean { return this._items.some(item => item.claimedAt === null); }

  getStatistics(): QueueStatistics {
    const waitTimes = this._items.filter(i => i.claimedAt).map(i => i.claimedAt!.getTime() - i.enqueuedAt.getTime());
    const processTimes = this._items.filter(i => i.completedAt).map(i => i.completedAt!.getTime() - i.enqueuedAt.getTime());
    return {
      totalEnqueued: this._totalEnqueued, totalClaimed: this._totalClaimed, totalCompleted: this._totalCompleted,
      totalFailed: this._totalFailed, totalCancelled: this._totalCancelled, totalTimeout: this._totalTimeout,
      currentLength: this._items.length,
      averageWaitTime: waitTimes.length ? waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length : 0,
      averageProcessingTime: processTimes.length ? processTimes.reduce((a, b) => a + b, 0) / processTimes.length : 0,
    };
  }

  clear(): void { this._items = []; }
}
