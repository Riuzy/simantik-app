import { Router } from 'express';
import { prisma } from '../../../lib/prisma';
import { SettingRepository } from '../repositories/setting.repository';
import { SettingService } from '../services/setting.service';
import { SettingController } from '../controllers/setting.controller';
import { requireAuth } from '../../../middlewares/auth';
import { validate } from '../../../middlewares/validate';
import { settingKeyParamSchema, upsertSettingBodySchema } from '../validators/setting.validators';

const settingRepository = new SettingRepository(prisma);
const settingService = new SettingService(settingRepository);
const settingController = new SettingController(settingService);

export const settingRouter = Router();

settingRouter.get(
  '/',
  requireAuth,
  settingController.findAll
);

settingRouter.get(
  '/:key',
  requireAuth,
  validate({ params: settingKeyParamSchema }),
  settingController.findByKey
);

settingRouter.put(
  '/:key',
  requireAuth,
  validate({ params: settingKeyParamSchema, body: upsertSettingBodySchema }),
  settingController.upsert
);

settingRouter.delete(
  '/:key',
  requireAuth,
  validate({ params: settingKeyParamSchema }),
  settingController.delete
);
