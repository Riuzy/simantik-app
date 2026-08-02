import { AppError } from '../../../middlewares/error-handler';
import { ExecutionRepository } from '../repositories/execution.repository';

export class ExecutionService {
  constructor(private repository: ExecutionRepository) {}

  async list(page: number, limit: number, filters: Parameters<ExecutionRepository['list']>[2]) {
    const result = await this.repository.list(page, limit, filters);
    return {
      data: result.items,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }

  async getById(id: string) {
    const execution = await this.repository.getById(id);
    if (!execution) throw new AppError(404, 'Execution not found');
    return execution;
  }

  async delete(id: string) {
    const execution = await this.repository.getById(id);
    if (!execution) throw new AppError(404, 'Execution not found');
    return this.repository.delete(id);
  }

  async retry(id: string, body: { headless?: boolean; browser?: string; viewportWidth?: number; viewportHeight?: number }) {
    const execution = await this.repository.getById(id);
    if (!execution) throw new AppError(404, 'Execution not found');
    if (execution.status !== 'FAILED' && execution.status !== 'ERROR' && execution.status !== 'PASSED') {
      throw new AppError(400, 'Only failed, error, or passed executions can be retried');
    }
    if (!execution.testCaseId) {
      throw new AppError(400, 'Cannot retry execution without test case');
    }
    return this.repository.retry(id, body);
  }

  async getLogs(executionId: string) {
    const execution = await this.repository.getById(executionId);
    if (!execution) throw new AppError(404, 'Execution not found');
    return this.repository.getLogs(executionId);
  }

  async getReport(executionId: string) {
    const execution = await this.repository.getById(executionId);
    if (!execution) throw new AppError(404, 'Execution not found');
    return this.repository.getReport(executionId);
  }
}
