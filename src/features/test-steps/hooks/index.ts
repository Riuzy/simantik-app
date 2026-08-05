'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import * as testStepService from '../services';
import type { CreateTestStepForm, UpdateTestStepForm, ReorderStepsForm } from '../types';

export function useCreateTestStep(testCaseId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTestStepForm) =>
      testStepService.createTestStep(testCaseId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['test-case', testCaseId] });
      qc.invalidateQueries({ queryKey: ['test-case-by-code'] });
      notifications.show({ title: 'Success', message: 'Test step added', color: 'green' });
    },
    onError: () =>
      notifications.show({ title: 'Error', message: 'Failed to add test step', color: 'red' }),
  });
}

export function useUpdateTestStep(testCaseId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ stepNumber, data }: { stepNumber: number; data: UpdateTestStepForm }) =>
      testStepService.updateTestStep(testCaseId, stepNumber, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['test-case', testCaseId] });
      qc.invalidateQueries({ queryKey: ['test-case-by-code'] });
      notifications.show({ title: 'Success', message: 'Test step updated', color: 'green' });
    },
    onError: () =>
      notifications.show({ title: 'Error', message: 'Failed to update test step', color: 'red' }),
  });
}

export function useDeleteTestStep(testCaseId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (stepNumber: number) =>
      testStepService.deleteTestStep(testCaseId, stepNumber),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['test-case', testCaseId] });
      qc.invalidateQueries({ queryKey: ['test-case-by-code'] });
      qc.invalidateQueries({ queryKey: ['test-cases'] });
      notifications.show({ title: 'Success', message: 'Test step deleted', color: 'green' });
    },
    onError: () =>
      notifications.show({ title: 'Error', message: 'Failed to delete test step', color: 'red' }),
  });
}

export function useReorderTestSteps(testCaseId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: ReorderStepsForm) =>
      testStepService.reorderTestSteps(testCaseId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['test-case', testCaseId] });
      qc.invalidateQueries({ queryKey: ['test-case-by-code'] });
    },
    onError: () =>
      notifications.show({ title: 'Error', message: 'Failed to reorder steps', color: 'red' }),
  });
}
