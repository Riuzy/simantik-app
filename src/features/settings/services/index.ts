import { apiClient } from '../../../services/api-client';
import { API } from '../../../constants/api';
import type { AppSettings, Setting } from '../types';

export async function getAllSettings(): Promise<AppSettings> {
  const res = await apiClient.get(API.SETTINGS.TYPED);
  return res.data.data;
}

export async function getSetting(key: string): Promise<Setting> {
  const res = await apiClient.get(API.SETTINGS.DETAIL(key));
  return res.data.data;
}

export async function getSettingsByKeys(keys: string[]): Promise<Setting[]> {
  if (keys.length === 0) return [];
  const res = await apiClient.get(API.SETTINGS.BULK, { params: { keys: keys.join(',') } });
  return res.data.data;
}

export async function upsertSetting(key: string, value: unknown): Promise<Setting> {
  const res = await apiClient.put(API.SETTINGS.DETAIL(key), { value });
  return res.data.data;
}

export async function bulkUpsertSettings(settings: Record<string, unknown>): Promise<Setting[]> {
  const res = await apiClient.put(API.SETTINGS.BULK, { settings });
  return res.data.data;
}