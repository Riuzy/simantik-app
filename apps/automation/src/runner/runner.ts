import type { IRunner, ILogger } from '../core/interfaces';
import type { AutomationJob, AutomationContext, AutomationResult } from '../core/domain';

export abstract class Runner implements IRunner {
  abstract readonly name: string;
  protected logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger.child({ module: 'runner' });
  }

  abstract canHandle(job: AutomationJob): boolean;
  abstract initialize(): Promise<void>;
  abstract launch(job: AutomationJob): Promise<void>;
  abstract execute(context: AutomationContext, result: AutomationResult): Promise<AutomationResult>;
  abstract stop(): Promise<void>;
  abstract cancel(jobId: string): Promise<void>;
  abstract cleanup(job: AutomationJob): Promise<void>;
  abstract dispose(): Promise<void>;
}
