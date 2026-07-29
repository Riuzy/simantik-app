import { Router } from 'express';
import { prisma } from '../../../lib/prisma';
import { TestCaseRepository } from '../repositories/test-case.repository';
import { TestCaseService } from '../services/test-case.service';
import { TestCaseController } from '../controllers/test-case.controller';
import { requireAuth, requireRole } from '../../../middlewares/auth';
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
} from '../validators/test-case.validators';

const testCaseRepository = new TestCaseRepository(prisma);
const testCaseService = new TestCaseService(testCaseRepository);
const testCaseController = new TestCaseController(testCaseService);

export const testCaseRouter = Router();

testCaseRouter.get(
  '/',
  requireAuth,
  validate({ query: listTestCasesQuerySchema }),
  testCaseController.list
);

testCaseRouter.post(
  '/',
  requireAuth,
  requireRole('Manager', 'Tester'),
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
  requireRole('Manager', 'Tester'),
  validate({ params: idParamSchema, body: updateTestCaseBodySchema }),
  testCaseController.update
);

testCaseRouter.delete(
  '/:id',
  requireAuth,
  requireRole('Manager', 'Tester'),
  validate({ params: idParamSchema }),
  testCaseController.delete
);

testCaseRouter.post(
  '/:id/duplicate',
  requireAuth,
  requireRole('Manager', 'Tester'),
  validate({ params: idParamSchema, body: duplicateBodySchema }),
  testCaseController.duplicate
);

testCaseRouter.post(
  '/:id/clone',
  requireAuth,
  requireRole('Manager', 'Tester'),
  validate({ params: idParamSchema, body: cloneBodySchema }),
  testCaseController.clone
);

testCaseRouter.get(
  '/:testCaseId/steps',
  requireAuth,
  testCaseController.listSteps
);

testCaseRouter.post(
  '/:testCaseId/steps',
  requireAuth,
  requireRole('Manager', 'Tester'),
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
  requireRole('Manager', 'Tester'),
  validate({ params: testCaseAndStepParamSchema, body: updateStepBodySchema }),
  testCaseController.updateStep
);

testCaseRouter.delete(
  '/:testCaseId/steps/:stepNumber',
  requireAuth,
  requireRole('Manager', 'Tester'),
  validate({ params: testCaseAndStepParamSchema }),
  testCaseController.deleteStep
);