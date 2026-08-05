import { Router } from 'express';
import { prisma } from '../../../lib/prisma';
import { AutomationRepository } from '../repositories/automation.repository';
import { AutomationService } from '../services/automation.service';
import { AutomationController } from '../controllers/automation.controller';
import { requireAuth } from '../../../middlewares/auth';
import { validate } from '../../../middlewares/validate';
import {
  testCaseIdParamSchema,
  runTestBodySchema,
  generateScriptBodySchema,
} from '../validators/automation.validators';

const automationRepository = new AutomationRepository(prisma);
const automationService = new AutomationService(automationRepository);
const automationController = new AutomationController(automationService);

export const automationRouter = Router();

automationRouter.post(
  '/test-cases/:testCaseId/generate-script',
  requireAuth,
  validate({ params: testCaseIdParamSchema, body: generateScriptBodySchema }),
  automationController.generateScript
);

automationRouter.get(
  '/test-cases/:testCaseId/script',
  requireAuth,
  validate({ params: testCaseIdParamSchema }),
  automationController.getScript
);

automationRouter.post(
  '/test-cases/:testCaseId/run',
  requireAuth,
  validate({ params: testCaseIdParamSchema, body: runTestBodySchema }),
  automationController.run
);

automationRouter.post(
  '/test-cases/:testCaseId/reset-execution',
  requireAuth,
  validate({ params: testCaseIdParamSchema }),
  automationController.resetExecutionHistory
);