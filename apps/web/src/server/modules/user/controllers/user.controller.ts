import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { ApiResponse } from '../../../utils/api-response';
import {
  userIdParamSchema,
  createUserBodySchema,
  updateUserBodySchema,
  resetPasswordBodySchema,
  changeRoleBodySchema,
  listUsersQuerySchema,
} from '../validators/user.validators';

export class UserController {
  constructor(private userService: UserService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = createUserBodySchema.parse(req.body);
      const user = await this.userService.create(body);
      ApiResponse.created(res, user);
    } catch (error) { next(error); }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = userIdParamSchema.parse(req.params);
      const user = await this.userService.getById(params.id);
      ApiResponse.success(res, user);
    } catch (error) { next(error); }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = userIdParamSchema.parse(req.params);
      const body = updateUserBodySchema.parse(req.body);
      const user = await this.userService.update(params.id, body);
      ApiResponse.success(res, user);
    } catch (error) { next(error); }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = userIdParamSchema.parse(req.params);
      await this.userService.softDelete(params.id);
      ApiResponse.noContent(res);
    } catch (error) { next(error); }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = listUsersQuerySchema.parse(req.query);
      const result = await this.userService.list(query.page, query.limit, {
        roleId: query.roleId,
        isActive: query.isActive,
        search: query.search,
      });
      ApiResponse.paginated(res, result.data, result.pagination.page, result.pagination.limit, result.pagination.total, result.pagination.totalPages);
    } catch (error) { next(error); }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = userIdParamSchema.parse(req.params);
      const body = resetPasswordBodySchema.parse(req.body);
      await this.userService.resetPassword(params.id, body);
      ApiResponse.success(res, { message: 'Password reset successfully. User must change password on next login.' });
    } catch (error) { next(error); }
  };

  activate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = userIdParamSchema.parse(req.params);
      await this.userService.activateUser(params.id);
      ApiResponse.success(res, { message: 'User activated successfully' });
    } catch (error) { next(error); }
  };

  deactivate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = userIdParamSchema.parse(req.params);
      await this.userService.deactivateUser(params.id);
      ApiResponse.success(res, { message: 'User deactivated successfully' });
    } catch (error) { next(error); }
  };

  changeRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = userIdParamSchema.parse(req.params);
      const body = changeRoleBodySchema.parse(req.body);
      const user = await this.userService.changeRole(params.id, body);
      ApiResponse.success(res, user);
    } catch (error) { next(error); }
  };

  getRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roles = await this.userService.getAllRoles();
      ApiResponse.success(res, roles);
    } catch (error) { next(error); }
  };
}