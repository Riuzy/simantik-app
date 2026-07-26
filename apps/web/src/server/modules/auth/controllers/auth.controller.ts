import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../../middlewares/auth';
import { AuthService } from '../services/auth.service';
import { AppError } from '../../../middlewares/error-handler';
import { ApiResponse } from '../../../utils/api-response';
import {
  loginBodySchema,
  refreshTokenBodySchema,
  changePasswordBodySchema,
} from '../validators/auth.validators';

export class AuthController {
  constructor(private authService: AuthService) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = loginBodySchema.parse(req.body);
      const result = await this.authService.login(body);
      ApiResponse.success(res, result);
    } catch (error) { next(error); }
  };

  logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) { next(error); }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = refreshTokenBodySchema.parse(req.body);
      const tokens = await this.authService.refreshToken(body);
      ApiResponse.success(res, tokens);
    } catch (error) { next(error); }
  };

  getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      const user = await this.authService.getCurrentUser(req.user.id);
      ApiResponse.success(res, user);
    } catch (error) { next(error); }
  };

  changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      const body = changePasswordBodySchema.parse(req.body);
      await this.authService.changePassword(req.user.id, body);
      ApiResponse.success(res, { message: 'Password changed successfully' });
    } catch (error) { next(error); }
  };
}