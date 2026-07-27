import type { IExecutionManager, ILogger, IRunner, IReporter, IArtifactManager } from './interfaces';
import type { AutomationConfig } from '../config';
import { AutomationJob } from './domain/automation-job';
import { AutomationContext } from './domain/automation-context';
import { AutomationResult } from './domain/automation-result';
import { AutomationLifecycle } from './domain/enums';
import { ExecutionException } from './domain/exceptions';

export class ExecutionManager implements IExecutionManager {
  private _logger: ILogger;
  private _runner: IRunner;
  private _reporter: IReporter;
  private _artifactManager: IArtifactManager;

  constructor(
    private _config: AutomationConfig,
    logger: ILogger,
    runner: IRunner,
    reporter: IReporter,
    artifactManager: IArtifactManager,
  ) {
    this._logger = logger.child({ module: 'execution-manager' });
    this._runner = runner;
    this._reporter = reporter;
    this._artifactManager = artifactManager;
  }

  async initialize(): Promise<void> {
    this._logger.info('Execution manager initialized');
    await this._runner.initialize();
  }

  async prepare(job: AutomationJob): Promise<AutomationContext> {
    this._logger.info({ jobId: job.id }, 'Preparing execution context');
    const config = this._config;
    const context = new AutomationContext(job, config, this._logger);
    context.state.transitionTo(AutomationLifecycle.INITIALIZED);
    context.state.transitionTo(AutomationLifecycle.PREPARING);
    return context;
  }

  async execute(
    context: AutomationContext,
    result: AutomationResult,
  ): Promise<AutomationResult> {
    const job = context.job;
    this._logger.info({ jobId: job.id, runner: this._runner.name }, 'Executing job');
    context.state.transitionTo(AutomationLifecycle.RUNNING);
    job.markStarted();
    result.startTime = job.startedAt;

    if (!this._runner.canHandle(job)) {
      const err: Error = new Error(`Runner ${this._runner.name} cannot handle job ${job.id}`);
      result.fail({ message: err.message, code: 'RUNNER_MISMATCH' });
      context.state.transitionTo(AutomationLifecycle.FAILED);
      return result;
    }

    try {
      const output = await this._runner.execute(context, result);
      context.state.transitionTo(AutomationLifecycle.COMPLETED);
      return output;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      result.fail({ message, code: 'EXECUTION_ERROR' });
      context.state.transitionTo(AutomationLifecycle.FAILED);
      return result;
    }
  }

  async finish(context: AutomationContext, result: AutomationResult): Promise<void> {
    this._logger.info({ jobId: context.job.id, status: result.status }, 'Finishing execution');
    context.state.transitionTo(AutomationLifecycle.CLEANING);
    await this._runner.cleanup(context.job);
    await this._artifactManager.cleanup(context.job.id);
    await this._reporter.report(result);
    context.state.transitionTo(AutomationLifecycle.FINISHED);
  }

  async cancel(executionId: string): Promise<void> {
    this._logger.info({ executionId }, 'Cancelling execution');
    await this._runner.cancel(executionId);
    await this._runner.dispose();
  }

  async fail(executionId: string, error: Error): Promise<void> {
    this._logger.error({ executionId, err: error }, 'Execution failed');
    throw new ExecutionException(error.message, executionId);
  }

  async cleanup(context: AutomationContext): Promise<void> {
    this._logger.info({ jobId: context.job.id }, 'Cleaning up execution');
    await this._runner.cleanup(context.job);
    await this._artifactManager.cleanup(context.job.id);
    context.clear();
  }
}
