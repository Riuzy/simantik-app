import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../middlewares/auth';
import { ActivityLogService } from '../services/activity-log.service';
import { AppError } from '../../../middlewares/error-handler';
import { ApiResponse } from '../../../utils/api-response';
import {
  idParamSchema,
  listActivityLogsQuerySchema,
} from '../validators/activity-log.validators';

export class ActivityLogController {
  constructor(private activityLogService: ActivityLogService) {}

  list = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      const query = listActivityLogsQuerySchema.parse(req.query);
      const result = await this.activityLogService.list(query);
      ApiResponse.paginated(res, result.data, result.pagination.page, result.pagination.limit, result.pagination.total, result.pagination.totalPages);
    } catch (error) { next(error); }
  };

  listByEntity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      const params = idParamSchema.parse(req.params);
      const entity = req.params.entity as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await this.activityLogService.findByEntity(entity, params.id, page, limit);
      ApiResponse.paginated(res, result.data, result.pagination.page, result.pagination.limit, result.pagination.total, result.pagination.totalPages);
    } catch (error) { next(error); }
  };
}
