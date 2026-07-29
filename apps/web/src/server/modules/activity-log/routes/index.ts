import { Router } from 'express';
import { prisma } from '../../../lib/prisma';
import { ActivityLogRepository } from '../repositories/activity-log.repository';
import { ActivityLogService } from '../services/activity-log.service';
import { ActivityLogController } from '../controllers/activity-log.controller';
import { requireAuth } from '../../../middlewares/auth';
import { validate } from '../../../middlewares/validate';
import {
  idParamSchema,
  listActivityLogsQuerySchema,
} from '../validators/activity-log.validators';

const activityLogRepository = new ActivityLogRepository(prisma);
const activityLogService = new ActivityLogService(activityLogRepository);
const activityLogController = new ActivityLogController(activityLogService);

export const activityLogRouter = Router();

activityLogRouter.get('/', requireAuth, validate({ query: listActivityLogsQuerySchema }), activityLogController.list);
activityLogRouter.get('/:entity/:id', requireAuth, validate({ params: idParamSchema }), activityLogController.listByEntity);
