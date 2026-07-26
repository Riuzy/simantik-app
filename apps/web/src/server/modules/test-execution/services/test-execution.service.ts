import { TestRunStatus } from '@prisma/client';
import { TestExecutionRepository } from '../repositories/test-execution.repository';
import { AppError } from '../../../middlewares/error-handler';
import {
  CreateTestRunDTO,
  UpdateTestRunDTO,
  UpdateExecutionDTO,
  UpdateExecutionResultDTO,
  TestRunFilters,
  ExecutionStatisticsDTO,
} from '../types/test-execution.dto';

export class TestExecutionService {
  constructor(private repository: TestExecutionRepository) {}

  // Test Run methods
  async createTestRun(dto: CreateTestRunDTO, executedById: string) {
    // Check code uniqueness
    const existingByCode = await this.repository.findTestRunByCode(dto.code);
    if (existingByCode) {
      throw new AppError(409, 'Test run with this code already exists');
    }

    const testRun = await this.repository.createTestRun({
      code: dto.code,
      name: dto.name,
      description: dto.description,
      projectId: dto.projectId,
      executedById,
      testCaseIds: dto.testCaseIds,
    });

    return testRun;
  }

  async getTestRunById(id: string) {
    const testRun = await this.repository.findTestRunById(id);
    if (!testRun) {
      throw new AppError(404, 'Test run not found');
    }

    // Get statistics
    const statistics = await this.repository.getTestRunStatistics(id);

    return {
      ...testRun,
      statistics,
    };
  }

  async updateTestRun(id: string, dto: UpdateTestRunDTO) {
    const testRun = await this.repository.updateTestRun(id, dto);
    return testRun;
  }

  async deleteTestRun(id: string) {
    const testRun = await this.repository.findTestRunById(id);
    if (!testRun) {
      throw new AppError(404, 'Test run not found');
    }
    await this.repository.softDeleteTestRun(id);
  }

  async listTestRuns(page: number, limit: number, filters: TestRunFilters) {
    const result = await this.repository.listTestRuns(page, limit, filters);
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

  async startTestRun(id: string) {
    const testRun = await this.repository.findTestRunById(id);
    if (!testRun) {
      throw new AppError(404, 'Test run not found');
    }

    if (testRun.status !== 'PLANNED') {
      throw new AppError(400, 'Test run can only be started when in PLANNED status');
    }

    await this.repository.startTestRun(id);

    return { message: 'Test run started successfully' };
  }

  async finishTestRun(id: string, status: TestRunStatus = 'COMPLETED') {
    const testRun = await this.repository.findTestRunById(id);
    if (!testRun) {
      throw new AppError(404, 'Test run not found');
    }

    if (testRun.status !== 'IN_PROGRESS') {
      throw new AppError(400, 'Test run can only be finished when in IN_PROGRESS status');
    }

    await this.repository.finishTestRun(id, status);

    return { message: 'Test run finished successfully' };
  }

  // Execution methods
  async updateExecution(testRunId: string, testCaseId: string, dto: UpdateExecutionDTO) {
    const execution = await this.repository.updateExecution(testRunId, testCaseId, {
      status: dto.status,
      testerId: dto.testerId,
    });

    return execution;
  }

  async getExecution(testRunId: string, testCaseId: string) {
    const execution = await this.repository.findExecution(testRunId, testCaseId);
    if (!execution) {
      throw new AppError(404, 'Execution not found');
    }
    return execution;
  }

  async listExecutions(testRunId: string, page: number, limit: number, status?: string) {
    const result = await this.repository.listExecutions(testRunId, page, limit, status);
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

  // Execution Result methods
  async updateExecutionResult(executionId: string, dto: UpdateExecutionResultDTO) {
    const result = await this.repository.updateExecutionResult(executionId, dto);
    return result;
  }

  async getExecutionById(executionId: string) {
    const execution = await this.repository.getExecutionById(executionId);
    if (!execution) {
      throw new AppError(404, 'Execution not found');
    }
    return execution;
  }

  // Statistics
  async getTestRunStatistics(testRunId: string): Promise<ExecutionStatisticsDTO> {
    const testRun = await this.repository.findTestRunById(testRunId);
    if (!testRun) {
      throw new AppError(404, 'Test run not found');
    }

    return this.repository.getTestRunStatistics(testRunId);
  }
}