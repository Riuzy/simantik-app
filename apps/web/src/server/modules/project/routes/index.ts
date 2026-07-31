import { Router } from 'express';
import { prisma } from '../../../lib/prisma';
import { ProjectRepository } from '../repositories/project.repository';
import { ProjectService } from '../services/project.service';
import { ProjectController } from '../controllers/project.controller';
import { requireAuth } from '../../../middlewares/auth';
import { validate } from '../../../middlewares/validate';
import {
  createProjectBodySchema,
  updateProjectBodySchema,
  listProjectsQuerySchema,
  projectParamSchema,
  slugParamSchema,
} from '../validators/project.validators';

const projectRepository = new ProjectRepository(prisma);
const projectService = new ProjectService(projectRepository);
const projectController = new ProjectController(projectService);

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
  validate({ body: createProjectBodySchema }),
  projectController.create
);

projectRouter.get(
  '/slug/:slug',
  requireAuth,
  validate({ params: slugParamSchema }),
  projectController.getBySlug
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
  validate({ params: projectParamSchema, body: updateProjectBodySchema }),
  projectController.update
);

projectRouter.delete(
  '/:id',
  requireAuth,
  validate({ params: projectParamSchema }),
  projectController.delete
);
