import { apiClient } from '../../../services/api-client';
import { API } from '../../../constants/api';
import type { GeneratedScript, Execution } from '../types';

export async function generateScript(testCaseId: string): Promise<GeneratedScript> {
  const res = await apiClient.post(API.AUTOMATION.GENERATE_SCRIPT(testCaseId));
  return res.data.data;
}

export async function runTest(testCaseId: string, data: { headless?: boolean }): Promise<Execution> {
  const res = await apiClient.post(API.AUTOMATION.RUN(testCaseId), data);
  return res.data.data;
}