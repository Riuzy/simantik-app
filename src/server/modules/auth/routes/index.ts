import { Router } from 'express';
import { prisma } from '../../../lib/prisma';
import { AuthRepository } from '../repositories/auth.repository';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../../../middlewares/auth';
import { validate } from '../../../middlewares/validate';
import { loginBodySchema, refreshTokenBodySchema, changePasswordBodySchema, updateProfileBodySchema } from '../validators/auth.validators';

const repository = new AuthRepository(prisma);
const service = new AuthService(repository);
const controller = new AuthController(service);

export const authRouter = Router();

authRouter.post('/login', validate({ body: loginBodySchema }), controller.login);
authRouter.post('/logout', requireAuth, controller.logout);
authRouter.post('/refresh', validate({ body: refreshTokenBodySchema }), controller.refreshToken);
authRouter.get('/me', requireAuth, controller.getCurrentUser);
authRouter.patch('/change-password', requireAuth, validate({ body: changePasswordBodySchema }), controller.changePassword);
authRouter.patch('/me', requireAuth, validate({ body: updateProfileBodySchema }), controller.updateProfile);
