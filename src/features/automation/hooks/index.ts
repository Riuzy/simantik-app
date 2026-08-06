'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import * as automationService from '../services';
import { ROUTES } from '../../../constants/routes';
import { getApiError } from '../../../utils/error-handler';
import type { GenerateScriptOptions } from '../types';

function isDev(): boolean {
  return process.env.NODE_ENV !== 'production';
}

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
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['automation-script', testCaseId] });
      notifications.show({
        title: 'Success',
        message: 'Script generated successfully.',
        color: 'green',
      });
      if (isDev()) {
            console.log('[AI] Generate success', { testCaseId, provider: result.provider, model: result.model });
      }
    },
    onError: (error) => {
      const message = getApiError(error, 'Failed to generate script.');
      if (isDev()) {
            console.error('[AI] Generate error', { testCaseId, error });
      }
      notifications.show({ title: 'Error', message, color: 'red' });
    },
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