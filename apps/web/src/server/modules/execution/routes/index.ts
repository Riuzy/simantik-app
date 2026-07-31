import { Router } from 'express';
import { prisma } from '../../../lib/prisma';
import { ExecutionRepository } from '../repositories/execution.repository';
import { ExecutionService } from '../services/execution.service';
import { ExecutionController } from '../controllers/execution.controller';
import { requireAuth } from '../../../middlewares/auth';
import { validate } from '../../../middlewares/validate';
import {
  idParamSchema,
  listExecutionsQuerySchema,
  retryExecutionBodySchema,
} from '../validators/execution.validators';

const executionRepository = new ExecutionRepository(prisma);
const executionService = new ExecutionService(executionRepository);
const executionController = new ExecutionController(executionService);

export const executionRouter = Router();

executionRouter.get(
  '/',
  requireAuth,
  validate({ query: listExecutionsQuerySchema }),
  executionController.list
);

executionRouter.get(
  '/:id',
  requireAuth,
  validate({ params: idParamSchema }),
  executionController.getById
);

executionRouter.delete(
  '/:id',
  requireAuth,
  validate({ params: idParamSchema }),
  executionController.delete
);

executionRouter.post(
  '/:id/retry',
  requireAuth,
  validate({ params: idParamSchema, body: retryExecutionBodySchema }),
  executionController.retry
);

executionRouter.get(
  '/:id/logs',
  requireAuth,
  validate({ params: idParamSchema }),
  executionController.getLogs
);

executionRouter.get(
  '/:id/report',
  requireAuth,
  validate({ params: idParamSchema }),
  executionController.getReport
);

executionRouter.get(
  '/:id/artifact/:name',
  requireAuth,
  validate({ params: idParamSchema }),
  executionController.getArtifact
);
