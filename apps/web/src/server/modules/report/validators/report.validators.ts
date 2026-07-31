import { z } from 'zod';
import { idParamSchema } from '../../../validators/common.validators';

export { idParamSchema };

export const reportProjectParamSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
});
