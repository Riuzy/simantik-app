import { z } from 'zod';
import { NotificationType } from '@prisma/client';
import { commonQuerySchema } from '../../../validators/common.validators';

export { idParamSchema } from '../../../validators/common.validators';

export const listNotificationsQuerySchema = commonQuerySchema.extend({
  type: z.nativeEnum(NotificationType).optional(),
  isRead: z.string().optional().transform(val => val === 'true'),
});

export const markReadBodySchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'At least one notification ID required'),
});
