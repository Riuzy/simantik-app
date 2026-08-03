'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import * as automationService from '../services';

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