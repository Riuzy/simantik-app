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
  validate({ query: listTestRunsQuerySchema }),
  testExecutionController.listTestRuns
);

testExecutionRouter.post(
  '/test-runs',
  requireAuth,
  requireRole('Tester'),
  validate({ body: createTestRunBodySchema }),
  testExecutionController.createTestRun
);

testExecutionRouter.get(
  '/test-runs/:id',
  requireAuth,
  validate({ params: idParamSchema }),
  testExecutionController.getTestRunById
);

testExecutionRouter.patch(
  '/test-runs/:id',
  requireAuth,
  requireRole('Tester'),
  validate({ params: idParamSchema, body: updateTestRunBodySchema }),
  testExecutionController.updateTestRun
);

testExecutionRouter.delete(
  '/test-runs/:id',
  requireAuth,
  requireRole('Tester'),
  validate({ params: idParamSchema }),
  testExecutionController.deleteTestRun
);

testExecutionRouter.post(
  '/test-runs/:id/start',
  requireAuth,
  requireRole('Tester'),
  validate({ params: idParamSchema, body: testCaseIdsBodySchema }),
  testExecutionController.startTestRun
);

testExecutionRouter.post(
  '/test-runs/:id/finish',
  requireAuth,
  requireRole('Tester'),
  validate({ params: idParamSchema, body: finishTestRunBodySchema }),
  testExecutionController.finishTestRun
);

testExecutionRouter.get(
  '/test-runs/:id/statistics',
  requireAuth,
  validate({ params: idParamSchema }),
  testExecutionController.getTestRunStatistics
);

testExecutionRouter.get(
  '/test-runs/:testRunId/executions',
  requireAuth,
  validate({ params: idParamSchema, query: listExecutionsQuerySchema }),
  testExecutionController.listExecutions
);

testExecutionRouter.get(
  '/test-runs/:testRunId/executions/:testCaseId',
  requireAuth,
  validate({ params: executionParamSchema }),
  testExecutionController.getExecution
);

testExecutionRouter.patch(
  '/test-runs/:testRunId/executions/:testCaseId',
  requireAuth,
  requireRole('Tester'),
  validate({ params: executionParamSchema, body: updateExecutionBodySchema }),
  testExecutionController.updateExecution
);

testExecutionRouter.get(
  '/executions/:executionId',
  requireAuth,
  validate({ params: idParamSchema }),
  testExecutionController.getExecutionById
);

testExecutionRouter.patch(
  '/executions/:executionId/result',
  requireAuth,
  requireRole('Tester'),
  validate({ params: idParamSchema, body: updateExecutionResultBodySchema }),
  testExecutionController.updateExecutionResult
);