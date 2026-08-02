import { z } from 'zod';

export const settingKeyParamSchema = z.object({
  key: z.string().min(1).max(100),
});

export const upsertSettingBodySchema = z.object({
  value: z.unknown().optional().nullable(),
});
