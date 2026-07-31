import { Router } from 'express';
import { prisma } from '../../../lib/prisma';
import { TestCaseRepository } from '../repositories/test-case.repository';
import { TestCaseService } from '../services/test-case.service';
import { TestCaseController } from '../controllers/test-case.controller';
import { requireAuth } from '../../../middlewares/auth';
import { validate } from '../../../middlewares/validate';
import {
  createTestCaseBodySchema,
  updateTestCaseBodySchema,
  idParamSchema,
  listTestCasesQuerySchema,
  duplicateBodySchema,
  cloneBodySchema,
  createStepBodySchema,
  updateStepBodySchema,
  testCaseAndStepParamSchema,
  reorderStepsBodySchema,
} from '../validators/test-case.validators';

const testCaseRepository = new TestCaseRepository(prisma);
const testCaseService = new TestCaseService(testCaseRepository);
const testCaseController = new TestCaseController(testCaseService);

export const testCaseRouter = Router();

testCaseRouter.get(
  '/code/:code',
  requireAuth,
  testCaseController.getByCode
);

testCaseRouter.get(
  '/',
  requireAuth,
  validate({ query: listTestCasesQuerySchema }),
  testCaseController.list
);

testCaseRouter.post(
  '/',
  requireAuth,
  validate({ body: createTestCaseBodySchema }),
  testCaseController.create
);

testCaseRouter.get(
  '/:id',
  requireAuth,
  validate({ params: idParamSchema }),
  testCaseController.getById
);

testCaseRouter.patch(
  '/:id',
  requireAuth,
  validate({ params: idParamSchema, body: updateTestCaseBodySchema }),
  testCaseController.update
);

testCaseRouter.delete(
  '/:id',
  requireAuth,
  validate({ params: idParamSchema }),
  testCaseController.delete
);

testCaseRouter.post(
  '/:id/duplicate',
  requireAuth,
  validate({ params: idParamSchema, body: duplicateBodySchema }),
  testCaseController.duplicate
);

testCaseRouter.post(
  '/:id/clone',
  requireAuth,
  validate({ params: idParamSchema, body: cloneBodySchema }),
  testCaseController.clone
);

testCaseRouter.get(
  '/:testCaseId/steps',
  requireAuth,
  testCaseController.listSteps
);

testCaseRouter.post(
  '/:testCaseId/steps/reorder',
  requireAuth,
  validate({ body: reorderStepsBodySchema }),
  testCaseController.reorderSteps
);

testCaseRouter.post(
  '/:testCaseId/steps',
  requireAuth,
  validate({ body: createStepBodySchema }),
  testCaseController.addStep
);

testCaseRouter.get(
  '/:testCaseId/steps/:stepNumber',
  requireAuth,
  validate({ params: testCaseAndStepParamSchema }),
  testCaseController.getStep
);

testCaseRouter.patch(
  '/:testCaseId/steps/:stepNumber',
  requireAuth,
  validate({ params: testCaseAndStepParamSchema, body: updateStepBodySchema }),
  testCaseController.updateStep
);

testCaseRouter.delete(
  '/:testCaseId/steps/:stepNumber',
  requireAuth,
  validate({ params: testCaseAndStepParamSchema }),
  testCaseController.deleteStep
);
