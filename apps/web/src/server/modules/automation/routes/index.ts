import { Router } from 'express';
import { prisma } from '../../../lib/prisma';
import { AutomationRepository } from '../repositories/automation.repository';
import { AutomationService } from '../services/automation.service';
import { AutomationController } from '../controllers/automation.controller';
import { requireAuth } from '../../../middlewares/auth';
import { validate } from '../../../middlewares/validate';
import {
  projectIdParamSchema,
  testCaseIdParamSchema,
  upsertAutomationConfigBodySchema,
  runTestBodySchema,
} from '../validators/automation.validators';

const automationRepository = new AutomationRepository(prisma);
const automationService = new AutomationService(automationRepository);
const automationController = new AutomationController(automationService);

export const automationRouter = Router();

automationRouter.get(
  '/projects/:projectId/automation-config',
  requireAuth,
  validate({ params: projectIdParamSchema }),
  automationController.getConfig
);

automationRouter.put(
  '/projects/:projectId/automation-config',
  requireAuth,
  validate({ params: projectIdParamSchema, body: upsertAutomationConfigBodySchema }),
  automationController.upsertConfig
);

automationRouter.post(
  '/test-cases/:testCaseId/generate-script',
  requireAuth,
  validate({ params: testCaseIdParamSchema }),
  automationController.generateScript
);

automationRouter.post(
  '/test-cases/:testCaseId/run',
  requireAuth,
  validate({ params: testCaseIdParamSchema, body: runTestBodySchema }),
  automationController.run
);
