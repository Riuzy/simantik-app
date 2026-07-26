import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../middlewares/auth';
import { TestExecutionService } from '../services/test-execution.service';
import { AppError } from '../../../middlewares/error-handler';
import { ApiResponse } from '../../../utils/api-response';
import {
  idParamSchema,
  executionParamSchema,
  listTestRunsQuerySchema,
  listExecutionsQuerySchema,
  createTestRunBodySchema,
  updateTestRunBodySchema,
  updateExecutionBodySchema,
  updateExecutionResultBodySchema,
  finishTestRunBodySchema,
} from '../validators/test-execution.validators';
import { TestRunStatus } from '@prisma/client';

export class TestExecutionController {
  constructor(private testExecutionService: TestExecutionService) {}

  createTestRun = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      const body = createTestRunBodySchema.parse(req.body);
      const testRun = await this.testExecutionService.createTestRun(body, req.user.id);
      ApiResponse.created(res, testRun);
    } catch (error) { next(error); }
  };

  getTestRunById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = idParamSchema.parse(req.params);
      const testRun = await this.testExecutionService.getTestRunById(params.id);
      ApiResponse.success(res, testRun);
    } catch (error) { next(error); }
  };

  updateTestRun = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = idParamSchema.parse(req.params);
      const body = updateTestRunBodySchema.parse(req.body);
      const testRun = await this.testExecutionService.updateTestRun(params.id, body);
      ApiResponse.success(res, testRun);
    } catch (error) { next(error); }
  };

  deleteTestRun = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = idParamSchema.parse(req.params);
      await this.testExecutionService.deleteTestRun(params.id);
      ApiResponse.noContent(res);
    } catch (error) { next(error); }
  };

  listTestRuns = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = listTestRunsQuerySchema.parse(req.query);
      const result = await this.testExecutionService.listTestRuns(query.page, query.limit, {
        projectId: query.projectId,
        status: query.status as TestRunStatus | undefined,
        executedById: query.executedById,
        search: query.search,
        sortBy: query.sortBy as 'createdAt' | 'name' | 'startedAt' | 'updatedAt' | undefined,
        sortOrder: query.sortOrder,
      });
      ApiResponse.paginated(res, result.data, result.pagination.page, result.pagination.limit, result.pagination.total, result.pagination.totalPages);
    } catch (error) { next(error); }
  };

  startTestRun = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = idParamSchema.parse(req.params);
      const result = await this.testExecutionService.startTestRun(params.id);
      ApiResponse.success(res, result);
    } catch (error) { next(error); }
  };

  finishTestRun = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = idParamSchema.parse(req.params);
      const body = finishTestRunBodySchema.parse(req.body);
      const result = await this.testExecutionService.finishTestRun(params.id, body.status);
      ApiResponse.success(res, result);
    } catch (error) { next(error); }
  };

  updateExecution = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = executionParamSchema.parse(req.params);
      const body = updateExecutionBodySchema.parse(req.body);
      const execution = await this.testExecutionService.updateExecution(params.testRunId, params.testCaseId, body);
      ApiResponse.success(res, execution);
    } catch (error) { next(error); }
  };

  getExecution = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = executionParamSchema.parse(req.params);
      const execution = await this.testExecutionService.getExecution(params.testRunId, params.testCaseId);
      ApiResponse.success(res, execution);
    } catch (error) { next(error); }
  };

  listExecutions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = executionParamSchema.parse(req.params);
      const query = listExecutionsQuerySchema.parse(req.query);
      const result = await this.testExecutionService.listExecutions(params.testRunId, query.page, query.limit, query.status);
      ApiResponse.paginated(res, result.data, result.pagination.page, result.pagination.limit, result.pagination.total, result.pagination.totalPages);
    } catch (error) { next(error); }
  };

  updateExecutionResult = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = idParamSchema.parse(req.params);
      const body = updateExecutionResultBodySchema.parse(req.body);
      const result = await this.testExecutionService.updateExecutionResult(params.id, body);
      ApiResponse.success(res, result);
    } catch (error) { next(error); }
  };

  getExecutionById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = idParamSchema.parse(req.params);
      const execution = await this.testExecutionService.getExecutionById(params.id);
      ApiResponse.success(res, execution);
    } catch (error) { next(error); }
  };

  getTestRunStatistics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = idParamSchema.parse(req.params);
      const statistics = await this.testExecutionService.getTestRunStatistics(params.id);
      ApiResponse.success(res, statistics);
    } catch (error) { next(error); }
  };
}