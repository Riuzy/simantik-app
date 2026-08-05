import { z } from 'zod';
import { idParamSchema } from '../../../validators/common.validators';

export { idParamSchema };

export const reportProjectParamSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
});

const boolParam = z.enum(['true', 'false']).optional().default('true');

export const reportDownloadQuerySchema = z.object({
  summary: boolParam,
  testCase: boolParam,
  expectedResult: boolParam,
  actualResult: boolParam,
  status: boolParam,
});
