import type { AutomationConfig } from '../config';
import type { ILogger, IExecutionManager } from './interfaces';
import { AutomationJob, AutomationResult } from './domain';
import { AutomationException } from './domain/exceptions';
import { AutomationQueue, QueueManager } from '../queue';
import { WorkerManager, RetryPolicy, TimeoutManager } from '../worker';
import { ApiClient, ExecutionService, HealthService, PollingManager, HeartbeatManager } from '../adapters';

export class AutomationEngine {
  private _config: AutomationConfig;
  private _logger: ILogger;
  private _executionManager: IExecutionManager;
  private _queueManager: QueueManager;
  private _workerManager: WorkerManager;
  private _apiClient: ApiClient;
  private _executionService: ExecutionService;
  private _healthService: HealthService;
  private _pollingManager: PollingManager;
  private _heartbeatManager: HeartbeatManager;
  private _isRunning = false;

  constructor(
    config: AutomationConfig,
    logger: ILogger,
    executionManager: IExecutionManager,
  ) {
    this._config = config;
    this._logger = logger.child({ module: 'engine' });
    this._executionManager = executionManager;

    this._apiClient = new ApiClient({
      baseUrl: config.api.baseUrl,
      token: config.api.token,
      apiKey: config.api.apiKey,
      requestTimeout: config.api.requestTimeout,
      retryCount: config.api.retryCount,
      retryDelay: config.api.retryDelay,
    }, logger);

    this._executionService = new ExecutionService(this._apiClient, logger);
    this._healthService = new HealthService(this._apiClient, logger);

    const queue = new AutomationQueue();
    this._queueManager = new QueueManager(queue, logger, config.worker.pollInterval);

    const retryPolicy = new RetryPolicy({
      maxRetries: config.retry.maxAttempts,
      baseDelayMs: config.retry.baseDelayMs,
    });

    const timeoutManager = new TimeoutManager({
      executionTimeout: config.timeout.execution,
      workerTimeout: config.timeout.worker,
      browserTimeout: config.timeout.browser,
      queueTimeout: config.timeout.queue,
    }, logger);

    this._workerManager = new WorkerManager(
      { workerCount: config.worker.count, pollInterval: config.worker.pollInterval },
      logger,
      this._queueManager,
      executionManager,
      retryPolicy,
      timeoutManager,
    );

    this._pollingManager = new PollingManager(
      this._executionService,
      logger,
      config.polling.interval,
      config.polling.maxBackoff,
    );

    this._heartbeatManager = new HeartbeatManager(
      this._executionService,
      logger,
      config.heartbeat.interval,
    );
  }

  async start(): Promise<void> {
    this._isRunning = true;
    this._logger.info('Automation engine starting');

    const serverAvailable = await this._healthService.waitForServer();
    if (!serverAvailable) {
      this._logger.warn('Starting without API server connection');
    }

    await this._executionManager.initialize();
    await this._workerManager.initialize();

    this._pollingManager.start((job) => {
      this.enqueueJob(job);
    });

    this._heartbeatManager.start('automation-engine');
    this._logger.info({ port: this._config.port, workers: this._config.worker.count }, 'Automation engine started');
  }

  async stop(): Promise<void> {
    this._isRunning = false;
    this._logger.info('Automation engine stopping');
    this._heartbeatManager.stop();
    this._pollingManager.stop();
    await this._workerManager.shutdown();
    this._queueManager.stopPolling();
    this._logger.info('Automation engine stopped');
  }

  enqueueJob(job: AutomationJob): void {
    this._queueManager.enqueueJob(job);
    this._heartbeatManager.setLastActivity();
  }

  enqueueBatch(jobs: AutomationJob[]): void {
    this._queueManager.enqueueBatch(jobs);
  }

  async executeJob(job: AutomationJob): Promise<AutomationResult> {
    const result = new AutomationResult(job.id, job.executionId);
    try {
      await this._executionService.startExecution(job.executionId);
      const context = await this._executionManager.prepare(job);
      const output = await this._executionManager.execute(context, result);
      await this._executionManager.finish(context, output);
      await this._executionService.completeExecution(job.executionId, {
        passed: output.passed, failed: output.failed, skipped: output.skipped, duration: output.duration ?? 0,
      });
      return output;
    } catch (err) {
      const message = err instanceof AutomationException ? err.message : 'Unexpected error';
      result.fail({ message, code: 'ENGINE_ERROR' });
      await this._executionService.failExecution(job.executionId, message).catch(() => {});
      this._logger.error({ err, jobId: job.id }, 'Engine execution failed');
      return result;
    }
  }

  cancelExecution(executionId: string): void {
    this._queueManager.cancelJob(executionId);
    this._executionService.cancelExecution(executionId).catch(() => {});
    this._executionManager.cancel(executionId).catch((err) => {
      this._logger.error({ err, executionId }, 'Failed to cancel execution');
    });
  }

  getQueueManager(): QueueManager { return this._queueManager; }
  getWorkerManager(): WorkerManager { return this._workerManager; }
  getHealthService(): HealthService { return this._healthService; }
  isRunning(): boolean { return this._isRunning; }
}
