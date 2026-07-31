'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import * as automationService from '../services';
import type { UpsertAutomationConfigForm } from '../types';

export function useAutomationConfig(projectId: string) {
  return useQuery({
    queryKey: ['automation-config', projectId],
    queryFn: () => automationService.getAutomationConfig(projectId),
    enabled: !!projectId,
  });
}

export function useUpsertAutomationConfig(projectId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: UpsertAutomationConfigForm) => automationService.upsertAutomationConfig(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['automation-config', projectId] });
      notifications.show({ title: 'Success', message: 'Automation config saved', color: 'green' });
    },
    onError: () => notifications.show({ title: 'Error', message: 'Failed to save automation config', color: 'red' }),
  });
}

export function useGenerateScript(testCaseId: string) {
  return useMutation({
    mutationFn: () => automationService.generateScript(testCaseId),
    onError: () => notifications.show({ title: 'Error', message: 'Failed to generate script', color: 'red' }),
  });
}

export function useRunTest() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ testCaseId, data }: { testCaseId: string; data: { headless?: boolean } }) =>
      automationService.runTest(testCaseId, data),
    onSuccess: (execution) => {
      qc.invalidateQueries({ queryKey: ['executions'] });
      qc.invalidateQueries({ queryKey: ['execution', execution.id] });
      notifications.show({ title: 'Success', message: `Execution ${execution.number} started`, color: 'green' });
      router.push(`/executions/${execution.id}`);
    },
    onError: () => notifications.show({ title: 'Error', message: 'Failed to run test', color: 'red' }),
  });
}
