import { Router } from 'express';
import { prisma } from '../../../lib/prisma';
import { AuthRepository } from '../repositories/auth.repository';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../../../middlewares/auth';
import { validate } from '../../../middlewares/validate';
import {
  loginBodySchema,
  refreshTokenBodySchema,
  changePasswordBodySchema,
} from '../validators/auth.validators';

const authRepository = new AuthRepository(prisma);
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

export const authRouter = Router();

authRouter.post('/login', validate(loginBodySchema), authController.login);
authRouter.post('/logout', requireAuth, authController.logout);
authRouter.post('/refresh', validate(refreshTokenBodySchema), authController.refreshToken);
authRouter.get('/me', requireAuth, authController.getCurrentUser);
authRouter.patch('/change-password', requireAuth, validate(changePasswordBodySchema), authController.changePassword);