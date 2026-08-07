'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import * as settingService from '../services';
import type { AppSettings, Setting } from '../types';

export function useSettings() {
  return useQuery<AppSettings>({
    queryKey: ['settings'],
    queryFn: () => settingService.getAllSettings(),
  });
}

export function useSetting(key: string) {
  return useQuery<Setting>({
    queryKey: ['settings', key],
    queryFn: () => settingService.getSetting(key),
    enabled: !!key,
  });
}

export function useUpsertSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) => settingService.upsertSetting(key, value),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      notifications.show({ title: 'Success', message: 'Setting saved', color: 'green' });
    },
    onError: () => notifications.show({ title: 'Error', message: 'Failed to save setting', color: 'red' }),
  });
}

export function useBulkUpsertSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (settings: Record<string, unknown>) => settingService.bulkUpsertSettings(settings),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      notifications.show({ title: 'Success', message: 'Settings saved', color: 'green' });
    },
    onError: () => notifications.show({ title: 'Error', message: 'Failed to save settings', color: 'red' }),
  });
}