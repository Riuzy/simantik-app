import { apiClient } from '../../../services/api-client';
import { API } from '../../../constants/api';
import type { GeneratedScript, GenerateScriptOptions, RunExecutionResponse, StoredScript } from '../types';

function isDev(): boolean {
  return process.env.NODE_ENV !== 'production';
}

export async function generateScript(testCaseId: string, options: GenerateScriptOptions = {}): Promise<GeneratedScript> {
  if (isDev()) {
    console.log('[AI] Generate request payload', { testCaseId, options });
  }
  const res = await apiClient.post(API.AUTOMATION.GENERATE_SCRIPT(testCaseId), options);
  if (isDev()) {
    console.log('[AI] Generate response', res.data?.data);
  }
  return res.data.data;
}

export async function getStoredScript(testCaseId: string): Promise<StoredScript> {
  const res = await apiClient.get(API.AUTOMATION.SCRIPT(testCaseId));
  return res.data.data;
}

export async function runTest(testCaseId: string, data: { headless?: boolean }): Promise<RunExecutionResponse> {
  const res = await apiClient.post(API.AUTOMATION.RUN(testCaseId), data);
  if (!res.data?.success) {
    throw new Error(res.data?.message ?? 'Failed to run test');
  }
  return res.data.data;
}