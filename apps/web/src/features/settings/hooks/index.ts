'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import * as settingService from '../services';

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => settingService.listSettings(),
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

export function useDeleteSetting() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (key: string) => settingService.deleteSetting(key),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      notifications.show({ title: 'Success', message: 'Setting deleted', color: 'green' });
    },
    onError: () => notifications.show({ title: 'Error', message: 'Failed to delete setting', color: 'red' }),
  });
}
