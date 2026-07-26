import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../middlewares/auth';
import { TestCaseService } from '../services/test-case.service';
import { AppError } from '../../../middlewares/error-handler';
import { ApiResponse } from '../../../utils/api-response';
import { TestCaseStatus, TestPriority } from '@prisma/client';
import {
  idParamSchema,
  testCaseAndStepParamSchema,
  duplicateBodySchema,
  cloneBodySchema,
  createStepBodySchema,
  updateStepBodySchema,
} from '../validators/test-case.validators';

export class TestCaseController {
  constructor(private testCaseService: TestCaseService) {}

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required');
      }

      const testCase = await this.testCaseService.create(req.body, req.user.id);
      ApiResponse.created(res, testCase);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = idParamSchema.parse(req.params);
      const testCase = await this.testCaseService.getById(params.id);
      ApiResponse.success(res, testCase);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = idParamSchema.parse(req.params);
      const testCase = await this.testCaseService.update(params.id, req.body);
      ApiResponse.success(res, testCase);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = idParamSchema.parse(req.params);
      await this.testCaseService.delete(params.id);
      ApiResponse.noContent(res);
    } catch (error) {
      next(error);
    }
  };

  list = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const projectId = req.query.projectId as string;
      const status = req.query.status as string;
      const priority = req.query.priority as string;
      const createdById = req.query.createdById as string;
      const search = req.query.search as string;
      const sortBy = req.query.sortBy as 'createdAt' | 'title' | 'updatedAt' | 'priority' || 'createdAt';
      const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'desc';

      const result = await this.testCaseService.list(page, limit, {
        projectId,
        status: status as TestCaseStatus | undefined,
        priority: priority as TestPriority | undefined,
        createdById,
        search,
        sortBy,
        sortOrder,
      });

      ApiResponse.paginated(
        res,
        result.data,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total,
        result.pagination.totalPages
      );
    } catch (error) {
      next(error);
    }
  };

  duplicate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = idParamSchema.parse(req.params);
      const body = duplicateBodySchema.parse(req.body);
      const testCase = await this.testCaseService.duplicate(params.id, body);
      ApiResponse.created(res, testCase);
    } catch (error) {
      next(error);
    }
  };

  clone = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = idParamSchema.parse(req.params);
      const body = cloneBodySchema.parse(req.body);
      const testCase = await this.testCaseService.clone(params.id, body.projectId, body);
      ApiResponse.created(res, testCase);
    } catch (error) {
      next(error);
    }
  };

  // Test Step endpoints
  addStep = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = testCaseAndStepParamSchema.parse({ testCaseId: req.params.testCaseId, stepNumber: '1' });
      const body = createStepBodySchema.parse(req.body);
      const step = await this.testCaseService.addStep(params.testCaseId, body);
      ApiResponse.created(res, step);
    } catch (error) {
      next(error);
    }
  };

  updateStep = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = testCaseAndStepParamSchema.parse(req.params);
      const body = updateStepBodySchema.parse(req.body);
      const step = await this.testCaseService.updateStep(params.testCaseId, params.stepNumber, body);
      ApiResponse.success(res, step);
    } catch (error) {
      next(error);
    }
  };

  deleteStep = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = testCaseAndStepParamSchema.parse(req.params);
      await this.testCaseService.deleteStep(params.testCaseId, params.stepNumber);
      ApiResponse.noContent(res);
    } catch (error) {
      next(error);
    }
  };

  getStep = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = testCaseAndStepParamSchema.parse(req.params);
      const step = await this.testCaseService.getStep(params.testCaseId, params.stepNumber);
      ApiResponse.success(res, step);
    } catch (error) {
      next(error);
    }
  };

  listSteps = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const testCaseId = req.params.testCaseId as string;
      const steps = await this.testCaseService.getStepsByTestCase(testCaseId);
      ApiResponse.success(res, steps);
    } catch (error) {
      next(error);
    }
  };
}