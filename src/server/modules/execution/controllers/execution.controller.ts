import { Response, NextFunction } from 'express';
import path from 'path';
import { AuthRequest } from '../../../middlewares/auth';
import { ExecutionService } from '../services/execution.service';
import { ApiResponse } from '../../../utils/api-response';
import { AppError } from '../../../middlewares/error-handler';
import {
  idParamSchema,
  listExecutionsQuerySchema,
  retryExecutionBodySchema,
} from '../validators/execution.validators';

export class ExecutionController {
  constructor(private executionService: ExecutionService) {}

  list = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = listExecutionsQuerySchema.parse(req.query);
      const result = await this.executionService.list(query.page, query.limit, {
        projectId: query.projectId,
        testCaseId: query.testCaseId,
        status: query.status,
        search: query.search,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      });
      ApiResponse.paginated(res, result.data, result.pagination.page, result.pagination.limit, result.pagination.total, result.pagination.totalPages);
    } catch (error) { next(error); }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = idParamSchema.parse(req.params);
      const execution = await this.executionService.getById(params.id);
      ApiResponse.success(res, execution);
    } catch (error) { next(error); }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = idParamSchema.parse(req.params);
      await this.executionService.delete(params.id);
      ApiResponse.success(res, { message: 'Execution deleted successfully' });
    } catch (error) { next(error); }
  };

  retry = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = idParamSchema.parse(req.params);
      const body = retryExecutionBodySchema.parse(req.body);
      const execution = await this.executionService.retry(params.id, body);
      ApiResponse.success(res, execution);
    } catch (error) { next(error); }
  };

  getLogs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = idParamSchema.parse(req.params);
      const logs = await this.executionService.getLogs(params.id);
      ApiResponse.success(res, logs);
    } catch (error) { next(error); }
  };

  getReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = idParamSchema.parse(req.params);
      const report = await this.executionService.getReport(params.id);
      ApiResponse.success(res, report);
    } catch (error) { next(error); }
  };

  getArtifact = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = idParamSchema.parse(req.params);
      const name = req.params.name as string;
      const artifactsDir = path.resolve(process.cwd(), '.artifacts', 'executions', params.id);
      const filePath = path.resolve(artifactsDir, name);

      if (!filePath.startsWith(artifactsDir)) {
        throw new AppError(400, 'Invalid artifact name');
      }

      res.sendFile(filePath, { dotfiles: 'allow' }, (err) => {
        if (err) {
          next(new AppError(404, 'Artifact not found'));
        }
      });
    } catch (error) { next(error); }
  };
}
