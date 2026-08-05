import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../middlewares/auth';
import { AIService } from '../services/ai.service';
import { ApiResponse } from '../../../utils/api-response';
import {
  saveAISettingSchema,
  testConnectionSchema,
  promptTemplateSchema,
} from '../validators/ai.validators';

export class AIController {
  constructor(private aiService: AIService) {}

  getSettings = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.aiService.getSettings();
      ApiResponse.success(res, result);
    } catch (error) { next(error); }
  };

  saveSettings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = saveAISettingSchema.parse(req.body);
      const result = await this.aiService.saveSettings(body);
      ApiResponse.success(res, result);
    } catch (error) { next(error); }
  };

  testConnection = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = testConnectionSchema.parse(req.body);
      const result = await this.aiService.testConnection(body);
      ApiResponse.success(res, result);
    } catch (error) { next(error); }
  };

  getPromptTemplates = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.aiService.getPromptTemplates();
      ApiResponse.success(res, result);
    } catch (error) { next(error); }
  };

  updatePromptTemplate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = promptTemplateSchema.parse(req.body);
      const result = await this.aiService.updatePromptTemplate(body.key, body.content);
      ApiResponse.success(res, result);
    } catch (error) { next(error); }
  };
}
