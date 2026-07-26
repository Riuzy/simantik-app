import { Router } from 'express';
import { prisma } from '../../../lib/prisma';
import { NotificationRepository } from '../repositories/notification.repository';
import { NotificationService } from '../services/notification.service';
import { NotificationController } from '../controllers/notification.controller';
import { requireAuth } from '../../../middlewares/auth';
import { validate } from '../../../middlewares/validate';
import {
  idParamSchema,
  listNotificationsQuerySchema,
  markReadBodySchema,
} from '../validators/notification.validators';

const notificationRepository = new NotificationRepository(prisma);
const notificationService = new NotificationService(notificationRepository);
const notificationController = new NotificationController(notificationService);

export const notificationRouter = Router();

notificationRouter.get('/', requireAuth, validate(listNotificationsQuerySchema), notificationController.list);
notificationRouter.get('/unread-count', requireAuth, notificationController.getUnreadCount);
notificationRouter.get('/:id', requireAuth, validate(idParamSchema), notificationController.getById);
notificationRouter.patch('/mark-read', requireAuth, validate(markReadBodySchema), notificationController.markAsRead);
notificationRouter.patch('/mark-all-read', requireAuth, notificationController.markAllAsRead);
notificationRouter.delete('/:id', requireAuth, validate(idParamSchema), notificationController.delete);
