import type { IReporter, ILogger } from '../core/interfaces';
import type { AutomationResult } from '../core/domain';

export class Reporter implements IReporter {
  private _logger: ILogger;

  constructor(logger: ILogger) {
    this._logger = logger.child({ module: 'reporter' });
  }

  async report(result: AutomationResult): Promise<void> {
    this._logger.info({ jobId: result.jobId, status: result.status }, 'Reporting result');
  }

  async reportBatch(results: AutomationResult[]): Promise<void> {
    for (const result of results) {
      await this.report(result);
    }
  }

  async generateSummary(): Promise<void> {
    this._logger.info('Generating execution summary');
  }
}
