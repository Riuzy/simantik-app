import { z } from 'zod';
import type { ApiClient } from './api-client';
import type { ILogger } from '../core/interfaces';

export const HealthSchema = z.object({
  status: z.string(),
  timestamp: z.string().optional(),
});

export class HealthService {
  private _apiClient: ApiClient;
  private _logger: ILogger;

  constructor(apiClient: ApiClient, logger: ILogger) {
    this._apiClient = apiClient;
    this._logger = logger.child({ module: 'health-service' });
  }

  async checkHealth(): Promise<boolean> {
    try {
      const result = await this._apiClient.get('/health', HealthSchema);
      return result.status === 'ok';
    } catch {
      return false;
    }
  }

  async waitForServer(maxRetries = 10, delayMs = 2000): Promise<boolean> {
    this._logger.info('Waiting for API server...');
    for (let i = 0; i < maxRetries; i++) {
      const healthy = await this.checkHealth();
      if (healthy) {
        this._logger.info('API server is available');
        return true;
      }
      this._logger.debug({ attempt: i + 1, maxRetries }, 'API server not ready yet');
      await new Promise(r => setTimeout(r, delayMs));
    }
    this._logger.error('API server not available after max retries');
    return false;
  }
}
