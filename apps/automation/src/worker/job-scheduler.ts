import type { AutomationJob } from '../core/domain';
import { JobLifecycle } from './types';
import type { ILogger, IExecutionManager } from '../core/interfaces';
import { RetryPolicy, type RetryContext } from './retry-policy';
import { TimeoutManager } from './timeout-manager';

const ALLOWED_JOB_TRANSITIONS: Record<JobLifecycle, JobLifecycle[]> = {
  [JobLifecycle.QUEUED]: [JobLifecycle.CLAIMED, JobLifecycle.CANCELLED],
  [JobLifecycle.CLAIMED]: [JobLifecycle.INITIALIZING, JobLifecycle.FAILED, JobLifecycle.CANCELLED],
  [JobLifecycle.INITIALIZING]: [JobLifecycle.RUNNING, JobLifecycle.FAILED, JobLifecycle.CANCELLED],
  [JobLifecycle.RUNNING]: [JobLifecycle.COMPLETED, JobLifecycle.FAILED, JobLifecycle.CANCELLED, JobLifecycle.TIMEOUT],
  [JobLifecycle.COMPLETED]: [],
  [JobLifecycle.FAILED]: [],
  [JobLifecycle.CANCELLED]: [],
  [JobLifecycle.TIMEOUT]: [],
};

export class JobScheduler {
  private _logger: ILogger;
  private _executionManager: IExecutionManager;
  private _retryPolicy: RetryPolicy;
  private _timeoutManager: TimeoutManager;
  private _jobLifecycles = new Map<string, JobLifecycle>();

  constructor(
    logger: ILogger,
    executionManager: IExecutionManager,
    retryPolicy: RetryPolicy,
    timeoutManager: TimeoutManager,
  ) {
    this._logger = logger.child({ module: 'job-scheduler' });
    this._executionManager = executionManager;
    this._retryPolicy = retryPolicy;
    this._timeoutManager = timeoutManager;
  }

  canTransitionTo(jobId: string, target: JobLifecycle): boolean {
    const current = this._jobLifecycles.get(jobId) ?? JobLifecycle.QUEUED;
    return ALLOWED_JOB_TRANSITIONS[current].includes(target);
  }

  transitionTo(jobId: string, target: JobLifecycle): void {
    const current = this._jobLifecycles.get(jobId) ?? JobLifecycle.QUEUED;
    if (!this.canTransitionTo(jobId, target)) {
      throw new Error(`Invalid job transition: ${current} → ${target}`);
    }
    this._jobLifecycles.set(jobId, target);
  }

  getLifecycle(jobId: string): JobLifecycle {
    return this._jobLifecycles.get(jobId) ?? JobLifecycle.QUEUED;
  }

  async processJob(job: AutomationJob): Promise<void> {
    this.transitionTo(job.id, JobLifecycle.CLAIMED);
    this._logger.info({ jobId: job.id }, 'Processing job');

    let attempt = 0;
    const execute = async (): Promise<void> => {
      attempt++;
      this.transitionTo(job.id, JobLifecycle.INITIALIZING);
      this._timeoutManager.startExecutionTimer(job.id, () => {
        this.transitionTo(job.id, JobLifecycle.TIMEOUT);
      });

      try {
        this.transitionTo(job.id, JobLifecycle.RUNNING);
        const result = new (await import('../core/domain')).AutomationResult(job.id, job.executionId);
        const context = await this._executionManager.prepare(job);
        const output = await this._executionManager.execute(context, result);
        await this._executionManager.finish(context, output);
        this._timeoutManager.cancelExecutionTimer(job.id);
        this.transitionTo(job.id, JobLifecycle.COMPLETED);
        this._logger.info({ jobId: job.id, status: output.status }, 'Job completed');
      } catch (err) {
        this._timeoutManager.cancelExecutionTimer(job.id);
        const error = err instanceof Error ? err : new Error(String(err));
        const retryCtx: RetryContext = {
          attempt,
          maxRetries: this._retryPolicy.maxRetries,
          lastError: error,
          jobId: job.id,
        };
        if (this._retryPolicy.shouldRetry(retryCtx)) {
          this._logger.warn({ jobId: job.id, attempt, error: error.message }, 'Retrying job');
          this.transitionTo(job.id, JobLifecycle.FAILED);
          await this._retryPolicy.wait(attempt);
          await execute();
        } else {
          this.transitionTo(job.id, JobLifecycle.FAILED);
          this._logger.error({ jobId: job.id, error: error.message }, 'Job failed');
        }
      }
    };

    await execute();
  }

  cancelJob(jobId: string): void {
    if (this.canTransitionTo(jobId, JobLifecycle.CANCELLED)) {
      this.transitionTo(jobId, JobLifecycle.CANCELLED);
      this._timeoutManager.cancelExecutionTimer(jobId);
      this._executionManager.cancel(jobId);
      this._logger.info({ jobId }, 'Job cancelled');
    }
  }
}
