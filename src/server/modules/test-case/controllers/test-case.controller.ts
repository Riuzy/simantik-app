import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../middlewares/auth';
import { TestCaseService } from '../services/test-case.service';
import { AppError } from '../../../middlewares/error-handler';
import { ApiResponse } from '../../../utils/api-response';
import { TestPriority, TestCaseStatus, TestCaseType, TestCaseLastResult } from '@prisma/client';
import {
  idParamSchema,
  testCaseAndStepParamSchema,
  duplicateBodySchema,
  cloneBodySchema,
  createStepBodySchema,
  updateStepBodySchema,
  testCaseAndCodeParamSchema,
  reorderStepsBodySchema,
  listTestCasesQuerySchema,
  createTestCaseBodySchema,
  updateTestCaseBodySchema,
} from '../validators/test-case.validators';

export class TestCaseController {
  constructor(private testCaseService: TestCaseService) {}

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required');
      }

      const body = createTestCaseBodySchema.parse(req.body);
      const testCase = await this.testCaseService.create(body, req.user.id);
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

  getByCode = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = testCaseAndCodeParamSchema.parse(req.params);
      const testCase = await this.testCaseService.getByCode(params.code);
      if (!testCase) {
        throw new AppError(404, 'Test case not found');
      }
      ApiResponse.success(res, testCase);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = idParamSchema.parse(req.params);
      const body = updateTestCaseBodySchema.parse(req.body);
      const testCase = await this.testCaseService.update(params.id, body);
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
      const query = listTestCasesQuerySchema.parse(req.query);

      const result = await this.testCaseService.list(query.page, query.limit, {
        projectId: query.projectId,
        priority: query.priority as TestPriority | undefined,
        status: query.status as TestCaseStatus | undefined,
        type: query.type as TestCaseType | undefined,
        lastResult: query.lastResult as TestCaseLastResult | undefined,
        module: query.module,
        tag: query.tag,
        createdById: query.createdById,
        search: query.search,
        sortBy: query.sortBy as 'createdAt' | 'title' | 'updatedAt' | 'priority' | 'code' | 'status' | 'type' | 'module' | 'project' | 'lastResult',
        sortOrder: query.sortOrder,
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

  listModules = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const modules = await this.testCaseService.listModules(req.query.projectId as string | undefined);
      ApiResponse.success(res, modules);
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

  addStep = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const testCaseId = req.params.testCaseId as string;
      const body = createStepBodySchema.parse(req.body);
      const step = await this.testCaseService.addStep(testCaseId, body);
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

  reorderSteps = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const testCaseId = req.params.testCaseId as string;
      const body = reorderStepsBodySchema.parse(req.body);
      const steps = await this.testCaseService.reorderSteps(testCaseId, body);
      ApiResponse.success(res, steps);
    } catch (error) {
      next(error);
    }
  };
}
