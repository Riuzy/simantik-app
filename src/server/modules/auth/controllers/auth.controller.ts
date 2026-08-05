import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../middlewares/auth';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../../../utils/api-response';

export class AuthController {
  constructor(private authService: AuthService) {}

  login = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.login(req.body);
      ApiResponse.success(res, result);
    } catch (error) { next(error); }
  };

  logout = async (_req: AuthRequest, res: Response): Promise<void> => {
    ApiResponse.success(res, { message: 'Logged out successfully' });
  };

  refreshToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tokens = await this.authService.refresh(req.body);
      ApiResponse.success(res, tokens);
    } catch (error) { next(error); }
  };

  getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ success: false, message: 'Authentication required', errors: [] }); return; }
      const user = await this.authService.getCurrentUser(req.user.id);
      ApiResponse.success(res, user);
    } catch (error) { next(error); }
  };

  changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ success: false, message: 'Authentication required', errors: [] }); return; }
      await this.authService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
      ApiResponse.success(res, { message: 'Password changed successfully' });
    } catch (error) { next(error); }
  };

  updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ success: false, message: 'Authentication required', errors: [] }); return; }
      const user = await this.authService.updateProfile(req.user.id, req.body);
      ApiResponse.success(res, user);
    } catch (error) { next(error); }
  };
}
