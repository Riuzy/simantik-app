import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../middlewares/auth';
import { SettingService } from '../services/setting.service';
import { ApiResponse } from '../../../utils/api-response';
import { settingKeyParamSchema, upsertSettingBodySchema } from '../validators/setting.validators';

export class SettingController {
  constructor(private settingService: SettingService) {}

  findAll = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const settings = await this.settingService.findAll();
      ApiResponse.success(res, settings);
    } catch (error) { next(error); }
  };

  findByKey = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = settingKeyParamSchema.parse(req.params);
      const setting = await this.settingService.findByKey(params.key);
      ApiResponse.success(res, setting);
    } catch (error) { next(error); }
  };

  upsert = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = settingKeyParamSchema.parse(req.params);
      const body = upsertSettingBodySchema.parse(req.body);
      const setting = await this.settingService.upsert(params.key, body.value);
      ApiResponse.success(res, setting);
    } catch (error) { next(error); }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = settingKeyParamSchema.parse(req.params);
      await this.settingService.delete(params.key);
      ApiResponse.noContent(res);
    } catch (error) { next(error); }
  };
}
