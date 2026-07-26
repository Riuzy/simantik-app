import { Router } from 'express';
import { prisma } from '../../../lib/prisma';
import { TestExecutionRepository } from '../repositories/test-execution.repository';
import { TestExecutionService } from '../services/test-execution.service';
import { TestExecutionController } from '../controllers/test-execution.controller';
import { requireAuth, requireRole } from '../../../middlewares/auth';
import { validate } from '../../../middlewares/validate';
import {
  createTestRunBodySchema,
  updateTestRunBodySchema,
  idParamSchema,
  listTestRunsQuerySchema,
  testCaseIdsBodySchema,
  finishTestRunBodySchema,
  updateExecutionBodySchema,
  updateExecutionResultBodySchema,
  executionParamSchema,
  listExecutionsQuerySchema,
} from '../validators/test-execution.validators';

const testExecutionRepository = new TestExecutionRepository(prisma);
const testExecutionService = new TestExecutionService(testExecutionRepository);
const testExecutionController = new TestExecutionController(testExecutionService);

export const testExecutionRouter = Router();

testExecutionRouter.get(
  '/test-runs',
  requireAuth,
  validate(listTestRunsQuerySchema),
  testExecutionController.listTestRuns
);

testExecutionRouter.post(
  '/test-runs',
  requireAuth,
  requireRole('Manager', 'Tester'),
  validate(createTestRunBodySchema),
  testExecutionController.createTestRun
);

testExecutionRouter.get(
  '/test-runs/:id',
  requireAuth,
  validate(idParamSchema),
  testExecutionController.getTestRunById
);

testExecutionRouter.patch(
  '/test-runs/:id',
  requireAuth,
  requireRole('Manager', 'Tester'),
  validate(idParamSchema),
  validate(updateTestRunBodySchema),
  testExecutionController.updateTestRun
);

testExecutionRouter.delete(
  '/test-runs/:id',
  requireAuth,
  requireRole('Manager', 'Tester'),
  validate(idParamSchema),
  testExecutionController.deleteTestRun
);

testExecutionRouter.post(
  '/test-runs/:id/start',
  requireAuth,
  requireRole('Manager', 'Tester'),
  validate(idParamSchema),
  validate(testCaseIdsBodySchema),
  testExecutionController.startTestRun
);

testExecutionRouter.post(
  '/test-runs/:id/finish',
  requireAuth,
  requireRole('Manager', 'Tester'),
  validate(idParamSchema),
  validate(finishTestRunBodySchema),
  testExecutionController.finishTestRun
);

testExecutionRouter.get(
  '/test-runs/:id/statistics',
  requireAuth,
  validate(idParamSchema),
  testExecutionController.getTestRunStatistics
);

testExecutionRouter.get(
  '/test-runs/:testRunId/executions',
  requireAuth,
  validate(listExecutionsQuerySchema),
  testExecutionController.listExecutions
);

testExecutionRouter.get(
  '/test-runs/:testRunId/executions/:testCaseId',
  requireAuth,
  validate(executionParamSchema),
  testExecutionController.getExecution
);

testExecutionRouter.patch(
  '/test-runs/:testRunId/executions/:testCaseId',
  requireAuth,
  requireRole('Manager', 'Tester'),
  validate(executionParamSchema),
  validate(updateExecutionBodySchema),
  testExecutionController.updateExecution
);

testExecutionRouter.get(
  '/executions/:executionId',
  requireAuth,
  validate(idParamSchema),
  testExecutionController.getExecutionById
);

testExecutionRouter.patch(
  '/executions/:executionId/result',
  requireAuth,
  requireRole('Manager', 'Tester'),
  validate(idParamSchema),
  validate(updateExecutionResultBodySchema),
  testExecutionController.updateExecutionResult
);
