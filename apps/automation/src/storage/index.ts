import type { ILogger } from '../core/interfaces';

export class StorageManager {
  private _logger: ILogger;

  constructor(_config: { artifactDir: string; reportDir: string }, logger: ILogger) {
    this._logger = logger.child({ module: 'storage' });
  }

  async initialize(): Promise<void> {
    this._logger.info('Storage initialized');
  }
}
