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
  validate({ query: listProjectsQuerySchema }),
  projectController.list
);

projectRouter.post(
  '/',
  requireAuth,
  requireRole('Manager'),
  validate({ body: createProjectBodySchema }),
  projectController.create
);

projectRouter.get(
  '/:id',
  requireAuth,
  validate({ params: projectParamSchema }),
  projectController.getById
);

projectRouter.patch(
  '/:id',
  requireAuth,
  requireRole('Manager'),
  validate({ params: projectParamSchema, body: updateProjectBodySchema }),
  projectController.update
);

projectRouter.delete(
  '/:id',
  requireAuth,
  requireRole('Manager'),
  validate({ params: projectParamSchema }),
  projectController.delete
);

projectRouter.post(
  '/:id/members',
  requireAuth,
  validate({ params: projectParamSchema, body: addMemberParamSchema }),
  projectController.addMember
);

projectRouter.delete(
  '/:id/members/:userId',
  requireAuth,
  validate({ params: removeMemberParamSchema }),
  projectController.removeMember
);

projectRouter.get(
  '/:id/members',
  requireAuth,
  validate({ params: listMembersParamSchema }),
  projectController.listMembers
);