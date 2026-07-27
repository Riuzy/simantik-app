import { z } from 'zod';
import type { ApiClient } from './api-client';
import type { ILogger } from '../core/interfaces';

export const ExecutionJobSchema = z.object({
  id: z.string(),
  executionId: z.string(),
  projectId: z.string(),
  testRunId: z.string(),
  environment: z.string().optional().default(''),
  browser: z.string(),
  baseUrl: z.string(),
  variables: z.record(z.string(), z.string()).optional(),
  headless: z.boolean().optional(),
  createdAt: z.string().optional(),
  status: z.string().optional().default('PENDING'),
});

export const ExecutionJobArraySchema = z.array(ExecutionJobSchema);

export const StatusUpdateSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

export class ExecutionService {
  private _apiClient: ApiClient;
  private _logger: ILogger;

  constructor(apiClient: ApiClient, logger: ILogger) {
    this._apiClient = apiClient;
    this._logger = logger.child({ module: 'execution-service' });
  }

  async claimJob(): Promise<z.infer<typeof ExecutionJobSchema> | null> {
    try {
      const jobs = await this._apiClient.get('/executions/pending', ExecutionJobArraySchema, { limit: 1 });
      return jobs.length > 0 ? jobs[0] : null;
    } catch (err) {
      this._logger.warn({ err }, 'Failed to claim job');
      return null;
    }
  }

  async updateStatus(executionId: string, status: string, payload?: Record<string, unknown>): Promise<void> {
    await this._apiClient.patch(`/executions/${executionId}/status`, StatusUpdateSchema, {
      status,
      ...payload,
    });
    this._logger.debug({ executionId, status }, 'Execution status updated');
  }

  async startExecution(executionId: string): Promise<void> {
    await this.updateStatus(executionId, 'RUNNING', { startedAt: new Date().toISOString() });
  }

  async completeExecution(executionId: string, result: { passed: number; failed: number; skipped: number; duration: number }): Promise<void> {
    await this.updateStatus(executionId, 'PASSED', {
      completedAt: new Date().toISOString(),
      ...result,
    });
  }

  async failExecution(executionId: string, error: string): Promise<void> {
    await this.updateStatus(executionId, 'FAILED', { error, completedAt: new Date().toISOString() });
  }

  async cancelExecution(executionId: string): Promise<void> {
    await this.updateStatus(executionId, 'CANCELLED');
  }

  async heartbeat(workerId: string, status: string, currentJobId: string | null): Promise<void> {
    await this._apiClient.post('/workers/heartbeat', StatusUpdateSchema, {
      workerId,
      status,
      currentJobId,
      timestamp: new Date().toISOString(),
    });
  }
}
