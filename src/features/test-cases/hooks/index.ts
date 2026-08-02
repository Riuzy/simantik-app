'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import * as testCaseService from '../services';
import type { CreateTestCaseForm, UpdateTestCaseForm } from '../schemas';

export function useTestCases(projectId: string, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['test-cases', projectId, params],
    queryFn: () => testCaseService.listTestCases(projectId, params),
    enabled: true,
  });
}

export function useTestCase(id: string) {
  return useQuery({
    queryKey: ['test-case', id],
    queryFn: () => testCaseService.getTestCase(id),
    enabled: !!id,
  });
}

export function useTestCaseByCode(code: string) {
  return useQuery({
    queryKey: ['test-case-by-code', code],
    queryFn: () => testCaseService.getTestCaseByCode(code),
    enabled: !!code,
  });
}

export function useCreateTestCase(projectId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTestCaseForm) =>
      testCaseService.createTestCase({ ...data, projectId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['test-cases', projectId] });
      notifications.show({ title: 'Success', message: 'Test case created', color: 'green' });
    },
    onError: () =>
      notifications.show({ title: 'Error', message: 'Failed to create test case', color: 'red' }),
  });
}

export function useUpdateTestCase(projectId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTestCaseForm }) =>
      testCaseService.updateTestCase(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['test-cases', projectId] });
      notifications.show({ title: 'Success', message: 'Test case updated', color: 'green' });
    },
    onError: () =>
      notifications.show({ title: 'Error', message: 'Failed to update test case', color: 'red' }),
  });
}

export function useDeleteTestCase(projectId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => testCaseService.deleteTestCase(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['test-cases', projectId] });
      notifications.show({ title: 'Success', message: 'Test case deleted', color: 'green' });
    },
    onError: () =>
      notifications.show({ title: 'Error', message: 'Failed to delete test case', color: 'red' }),
  });
}
