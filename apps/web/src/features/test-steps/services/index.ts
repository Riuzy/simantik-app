import { apiClient } from '../../../services/api-client';
import { API } from '../../../constants/api';
import type { TestStep, CreateTestStepForm, UpdateTestStepForm, ReorderStepsForm } from '../types';

export async function listTestSteps(testCaseId: string): Promise<TestStep[]> {
  const res = await apiClient.get(API.TEST_CASES.STEPS(testCaseId));
  return res.data.data;
}

export async function createTestStep(testCaseId: string, data: CreateTestStepForm): Promise<TestStep> {
  const res = await apiClient.post(API.TEST_CASES.STEPS(testCaseId), data);
  return res.data.data;
}

export async function updateTestStep(testCaseId: string, stepNumber: number, data: UpdateTestStepForm): Promise<TestStep> {
  const res = await apiClient.patch(API.TEST_CASES.STEP_DETAIL(testCaseId, stepNumber), data);
  return res.data.data;
}

export async function deleteTestStep(testCaseId: string, stepNumber: number): Promise<void> {
  await apiClient.delete(API.TEST_CASES.STEP_DETAIL(testCaseId, stepNumber));
}

export async function reorderTestSteps(testCaseId: string, data: ReorderStepsForm): Promise<TestStep[]> {
  const res = await apiClient.post(API.TEST_CASES.STEPS_REORDER(testCaseId), data);
  return res.data.data;
}
