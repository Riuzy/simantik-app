import { apiClient } from '../../../services/api-client';
import { API } from '../../../constants/api';
import type { GeneratedScript, RunExecutionResponse } from '../types';

export async function generateScript(testCaseId: string): Promise<GeneratedScript> {
  const res = await apiClient.post(API.AUTOMATION.GENERATE_SCRIPT(testCaseId));
  return res.data.data;
}

export async function runTest(testCaseId: string, data: { headless?: boolean }): Promise<RunExecutionResponse> {
  const res = await apiClient.post(API.AUTOMATION.RUN(testCaseId), data);
  if (!res.data?.success) {
    throw new Error(res.data?.message ?? 'Failed to run test');
  }
  return res.data.data;
}