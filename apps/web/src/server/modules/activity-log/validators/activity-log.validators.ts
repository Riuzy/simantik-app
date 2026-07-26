import { z } from 'zod';
import { commonQuerySchema } from '../../../validators/common.validators';

export { idParamSchema } from '../../../validators/common.validators';

export const listActivityLogsQuerySchema = commonQuerySchema.extend({
  entity: z.string().optional(),
  entityId: z.string().uuid('Invalid entity ID').optional(),
  action: z.string().optional(),
  userId: z.string().uuid('Invalid user ID').optional(),
});
