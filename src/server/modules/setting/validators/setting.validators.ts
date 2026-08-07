import { z } from 'zod';
import { SETTING_KEYS, isValidSettingKey } from '../constants/setting-keys';

const ALL_KEYS = Object.values(SETTING_KEYS) as string[];

export const settingKeyParamSchema = z.object({
  key: z.string().refine(isValidSettingKey, 'Invalid setting key'),
});

export const settingKeyQuerySchema = z.object({
  keys: z.array(z.string().refine((key) => ALL_KEYS.includes(key))).optional(),
});

export const upsertSettingBodySchema = z.object({
  value: z.unknown().optional().nullable(),
});

export const bulkUpsertSettingBodySchema = z.object({
  settings: z.record(z.string(), z.unknown()).refine(
    (obj) => {
      for (const key of Object.keys(obj)) {
        if (!ALL_KEYS.includes(key)) {
          return false;
        }
      }
      return true;
    },
    { message: 'Invalid setting key(s)' },
  ),
});