import { apiClient } from '../../../services/api-client';
import { API } from '../../../constants/api';
import type { TestCase, TestCaseListResponse, CreateTestCaseForm } from '../types';

export async function listTestCases(projectId: string, params?: Record<string, unknown>): Promise<TestCaseListResponse> {
  const res = await apiClient.get(API.TEST_CASES.BASE, {
    params: {
      ...(projectId ? { projectId } : {}),
      ...params,
    },
  });
  return { data: res.data.data, pagination: res.data.meta };
}

export async function listTestCaseModules(projectId?: string): Promise<string[]> {
  const res = await apiClient.get(API.TEST_CASES.MODULES, {
    params: projectId ? { projectId } : undefined,
  });
  return res.data.data;
}

export async function getTestCase(id: string): Promise<TestCase> {
  const res = await apiClient.get(API.TEST_CASES.DETAIL(id));
  return res.data.data;
}

export async function getTestCaseByCode(code: string): Promise<TestCase> {
  const res = await apiClient.get(API.TEST_CASES.BY_CODE(code));
  return res.data.data;
}

export async function createTestCase(data: CreateTestCaseForm): Promise<TestCase> {
  const res = await apiClient.post(API.TEST_CASES.BASE, data);
  return res.data.data;
}

export async function updateTestCase(id: string, data: Record<string, unknown>): Promise<TestCase> {
  const res = await apiClient.patch(API.TEST_CASES.DETAIL(id), data);
  return res.data.data;
}

export async function deleteTestCase(id: string): Promise<void> {
  await apiClient.delete(API.TEST_CASES.DETAIL(id));
}
