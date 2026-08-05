import { Router } from 'express';
import { prisma } from '../../../lib/prisma';
import { AIRepository } from '../repositories/ai.repository';
import { AIService } from '../services/ai.service';
import { AIController } from '../controllers/ai.controller';
import { requireAuth } from '../../../middlewares/auth';

const aiRepository = new AIRepository(prisma);
const aiService = new AIService(aiRepository);
const aiController = new AIController(aiService);

export const aiRouter = Router();

aiRouter.get('/ai/settings', requireAuth, aiController.getSettings);
aiRouter.put('/ai/settings', requireAuth, aiController.saveSettings);
aiRouter.post('/ai/test-connection', requireAuth, aiController.testConnection);
aiRouter.get('/ai/prompt-templates', requireAuth, aiController.getPromptTemplates);
aiRouter.put('/ai/prompt-templates', requireAuth, aiController.updatePromptTemplate);
