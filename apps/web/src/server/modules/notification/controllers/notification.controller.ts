import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../middlewares/auth';
import { NotificationService } from '../services/notification.service';
import { AppError } from '../../../middlewares/error-handler';
import { ApiResponse } from '../../../utils/api-response';
import {
  idParamSchema,
  listNotificationsQuerySchema,
  markReadBodySchema,
} from '../validators/notification.validators';

export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  list = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      const query = listNotificationsQuerySchema.parse(req.query);
      const result = await this.notificationService.list(req.user.id, query);
      ApiResponse.paginated(res, result.data, result.pagination.page, result.pagination.limit, result.pagination.total, result.pagination.totalPages);
    } catch (error) { next(error); }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      const params = idParamSchema.parse(req.params);
      const notification = await this.notificationService.getById(params.id, req.user.id);
      ApiResponse.success(res, notification);
    } catch (error) { next(error); }
  };

  markAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      const body = markReadBodySchema.parse(req.body);
      const result = await this.notificationService.markAsRead(body, req.user.id);
      ApiResponse.success(res, result);
    } catch (error) { next(error); }
  };

  markAllAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      const result = await this.notificationService.markAllAsRead(req.user.id);
      ApiResponse.success(res, result);
    } catch (error) { next(error); }
  };

  getUnreadCount = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      const result = await this.notificationService.getUnreadCount(req.user.id);
      ApiResponse.success(res, result);
    } catch (error) { next(error); }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      const params = idParamSchema.parse(req.params);
      await this.notificationService.delete(params.id, req.user.id);
      ApiResponse.noContent(res);
    } catch (error) { next(error); }
  };
}
