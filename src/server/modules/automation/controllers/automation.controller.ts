import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../middlewares/auth';
import { AutomationService } from '../services/automation.service';
import { AppError } from '../../../middlewares/error-handler';
import { ApiResponse } from '../../../utils/api-response';
import {
  testCaseIdParamSchema,
  runTestBodySchema,
  generateScriptBodySchema,
} from '../validators/automation.validators';

export class AutomationController {
  constructor(private automationService: AutomationService) {}

  generateScript = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = testCaseIdParamSchema.parse(req.params);
      const body = generateScriptBodySchema.parse(req.body ?? {});
      const result = await this.automationService.generateScript(params.testCaseId, body);
      ApiResponse.success(res, result);
    } catch (error) { next(error); }
  };

  getScript = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = testCaseIdParamSchema.parse(req.params);
      const result = await this.automationService.getScript(params.testCaseId);
      ApiResponse.success(res, result);
    } catch (error) { next(error); }
  };

  run = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      const params = testCaseIdParamSchema.parse(req.params);
      const body = runTestBodySchema.parse(req.body);
      const execution = await this.automationService.run(params.testCaseId, body);
      ApiResponse.success(res, execution);
    } catch (error) { next(error); }
  };

  resetExecutionHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = testCaseIdParamSchema.parse(req.params);
      const result = await this.automationService.resetExecutionHistory(params.testCaseId);
      ApiResponse.success(res, result);
    } catch (error) { next(error); }
  };
}