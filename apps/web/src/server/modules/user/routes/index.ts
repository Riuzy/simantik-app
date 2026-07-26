import { Router } from 'express';
import { prisma } from '../../../lib/prisma';
import { UserRepository } from '../repositories/user.repository';
import { UserService } from '../services/user.service';
import { UserController } from '../controllers/user.controller';
import { requireAuth, requireRole } from '../../../middlewares/auth';
import { validate } from '../../../middlewares/validate';
import {
  createUserBodySchema,
  updateUserBodySchema,
  resetPasswordBodySchema,
  changeRoleBodySchema,
  userIdParamSchema,
  listUsersQuerySchema,
} from '../validators/user.validators';

const userRepository = new UserRepository(prisma);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

export const userRouter = Router();

// GET /api/users/roles - Get all roles (authenticated)
userRouter.get('/roles', requireAuth, userController.getRoles);

// POST /api/users - Create user (Manager only)
userRouter.post(
  '/',
  requireAuth,
  requireRole('Manager'),
  validate(createUserBodySchema),
  userController.create
);

// GET /api/users - List users (authenticated)
userRouter.get(
  '/',
  requireAuth,
  validate(listUsersQuerySchema),
  userController.list
);

// GET /api/users/:id - Get user by ID (authenticated)
userRouter.get(
  '/:id',
  requireAuth,
  validate(userIdParamSchema),
  userController.getById
);

// PUT /api/users/:id - Update user (Manager only)
userRouter.put(
  '/:id',
  requireAuth,
  requireRole('Manager'),
  validate(userIdParamSchema),
  validate(updateUserBodySchema),
  userController.update
);

// DELETE /api/users/:id - Soft delete user (Manager only)
userRouter.delete(
  '/:id',
  requireAuth,
  requireRole('Manager'),
  validate(userIdParamSchema),
  userController.delete
);

// PATCH /api/users/:id/reset-password - Reset password (Manager only)
userRouter.patch(
  '/:id/reset-password',
  requireAuth,
  requireRole('Manager'),
  validate(userIdParamSchema),
  validate(resetPasswordBodySchema),
  userController.resetPassword
);

// PATCH /api/users/:id/activate - Activate user (Manager only)
userRouter.patch(
  '/:id/activate',
  requireAuth,
  requireRole('Manager'),
  validate(userIdParamSchema),
  userController.activate
);

// PATCH /api/users/:id/deactivate - Deactivate user (Manager only)
userRouter.patch(
  '/:id/deactivate',
  requireAuth,
  requireRole('Manager'),
  validate(userIdParamSchema),
  userController.deactivate
);

// PATCH /api/users/:id/change-role - Change user role (Manager only)
userRouter.patch(
  '/:id/change-role',
  requireAuth,
  requireRole('Manager'),
  validate(userIdParamSchema),
  validate(changeRoleBodySchema),
  userController.changeRole
);