import { Router } from 'express';
import { prisma } from '../../../lib/prisma';
import { ProjectRepository } from '../repositories/project.repository';
import { ProjectService } from '../services/project.service';
import { ProjectController } from '../controllers/project.controller';
import { UserRepository } from '../../user/repositories/user.repository';
import { UserService } from '../../user/services/user.service';
import { requireAuth, requireRole } from '../../../middlewares/auth';
import { validate } from '../../../middlewares/validate';
import {
  createProjectBodySchema,
  updateProjectBodySchema,
  listProjectsQuerySchema,
  addMemberParamSchema,
  removeMemberParamSchema,
  projectParamSchema,
  listMembersParamSchema,
} from '../validators/project.validators';

const projectRepository = new ProjectRepository(prisma);
const userRepository = new UserRepository(prisma);
const userService = new UserService(userRepository);
const projectService = new ProjectService(projectRepository);
const projectController = new ProjectController(projectService, userService);

export const projectRouter = Router();

projectRouter.get(
  '/',
  requireAuth,
  validate(listProjectsQuerySchema),
  projectController.list
);

projectRouter.post(
  '/',
  requireAuth,
  requireRole('Manager'),
  validate(createProjectBodySchema),
  projectController.create
);

projectRouter.get(
  '/:id',
  requireAuth,
  validate(projectParamSchema),
  projectController.getById
);

projectRouter.patch(
  '/:id',
  requireAuth,
  requireRole('Manager'),
  validate(projectParamSchema),
  validate(updateProjectBodySchema),
  projectController.update
);

projectRouter.delete(
  '/:id',
  requireAuth,
  requireRole('Manager'),
  validate(projectParamSchema),
  projectController.delete
);

projectRouter.post(
  '/:id/members',
  requireAuth,
  validate(projectParamSchema),
  validate(addMemberParamSchema),
  projectController.addMember
);

projectRouter.delete(
  '/:id/members/:userId',
  requireAuth,
  validate(removeMemberParamSchema),
  projectController.removeMember
);

projectRouter.get(
  '/:id/members',
  requireAuth,
  validate(listMembersParamSchema),
  projectController.listMembers
);