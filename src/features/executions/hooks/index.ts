'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import * as executionService from '../services';
import type { ListExecutionsParams } from '../types';

export function useExecutions(params?: ListExecutionsParams) {
  return useQuery({
    queryKey: ['executions', params],
    queryFn: () => executionService.listExecutions(params),
  });
}

export function useExecution(id: string) {
  return useQuery({
    queryKey: ['execution', id],
    queryFn: () => executionService.getExecution(id),
    enabled: !!id,
  });
}

export function useExecutionLogs(id: string, enabled: boolean) {
  return useQuery({
    queryKey: ['execution-logs', id],
    queryFn: () => executionService.getExecutionLogs(id),
    enabled: !!id && enabled,
  });
}

export function usePollExecution(id: string, enabled: boolean) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => {
      qc.invalidateQueries({ queryKey: ['execution', id] });
      qc.invalidateQueries({ queryKey: ['execution-logs', id] });
    }, 3000);
    return () => clearInterval(interval);
  }, [id, enabled, qc]);
}

export function useRetryExecution() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ executionId, body }: { executionId: string; body: Record<string, unknown> }) =>
      executionService.retryExecution(executionId, body),
    onSuccess: (execution) => {
      qc.invalidateQueries({ queryKey: ['executions'] });
      notifications.show({ title: 'Success', message: execution.message || 'Execution restarted', color: 'green' });
    },
    onError: () => notifications.show({ title: 'Error', message: 'Failed to retry execution', color: 'red' }),
  });
}

export function useDeleteExecution() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => executionService.deleteExecution(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['executions'] });
      notifications.show({ title: 'Success', message: 'Execution deleted successfully', color: 'green' });
    },
    onError: () => notifications.show({ title: 'Error', message: 'Failed to delete execution', color: 'red' }),
  });
}
