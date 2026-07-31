import { apiClient } from '../../../services/api-client';
import { API } from '../../../constants/api';
import type { Setting } from '../types';

export async function listSettings(): Promise<Setting[]> {
  const res = await apiClient.get(API.SETTINGS.BASE);
  return res.data.data;
}

export async function upsertSetting(key: string, value: unknown): Promise<Setting> {
  const res = await apiClient.put(API.SETTINGS.DETAIL(key), { value });
  return res.data.data;
}

export async function deleteSetting(key: string): Promise<void> {
  await apiClient.delete(API.SETTINGS.DETAIL(key));
}
