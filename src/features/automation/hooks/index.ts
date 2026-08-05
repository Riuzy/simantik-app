'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import * as automationService from '../services';
import { ROUTES } from '../../../constants/routes';
import type { GenerateScriptOptions } from '../types';

export function useStoredScript(testCaseId: string) {
  return useQuery({
    queryKey: ['automation-script', testCaseId],
    queryFn: () => automationService.getStoredScript(testCaseId),
    retry: false,
    enabled: !!testCaseId,
  });
}

export function useGenerateScript(testCaseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (options?: GenerateScriptOptions) => automationService.generateScript(testCaseId, options ?? {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['automation-script', testCaseId] });
    },
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
      qc.invalidateQueries({ queryKey: ['test-cases'] });
      notifications.show({
        title: 'Success',
        message: execution.message || 'Execution started',
        color: 'green',
      });
      router.push(ROUTES.EXECUTION_DETAIL(execution.executionId));
    },
    onError: () => notifications.show({ title: 'Error', message: 'Failed to run test', color: 'red' }),
  });
}