import { Router } from 'express';
import { prisma } from '../../../lib/prisma';
import { SettingRepository } from '../repositories/setting.repository';
import { SettingService } from '../services/setting.service';
import { SettingController } from '../controllers/setting.controller';
import { requireAuth } from '../../../middlewares/auth';
import { validate } from '../../../middlewares/validate';
import { settingKeyParamSchema, settingKeyQuerySchema, upsertSettingBodySchema, bulkUpsertSettingBodySchema } from '../validators/setting.validators';

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
  '/typed',
  requireAuth,
  settingController.getAllTyped
);

settingRouter.get(
  '/bulk',
  requireAuth,
  validate({ query: settingKeyQuerySchema }),
  settingController.findByKeys
);

settingRouter.get(
  '/:key',
  requireAuth,
  validate({ params: settingKeyParamSchema }),
  settingController.findByKey
);

settingRouter.put(
  '/bulk',
  requireAuth,
  validate({ body: bulkUpsertSettingBodySchema }),
  settingController.bulkUpsert
);

settingRouter.put(
  '/:key',
  requireAuth,
  validate({ params: settingKeyParamSchema, body: upsertSettingBodySchema }),
  settingController.upsert
);