import { apiClient } from '../../../services/api-client';
import { API } from '../../../constants/api';
import type { AutomationConfig, GeneratedScript, Execution, UpsertAutomationConfigForm } from '../types';

export async function getAutomationConfig(projectId: string): Promise<AutomationConfig | null> {
  const res = await apiClient.get(API.AUTOMATION.CONFIG(projectId));
  return res.data.data;
}

export async function upsertAutomationConfig(projectId: string, data: UpsertAutomationConfigForm): Promise<AutomationConfig> {
  const res = await apiClient.put(API.AUTOMATION.CONFIG(projectId), data);
  return res.data.data;
}

export async function generateScript(testCaseId: string): Promise<GeneratedScript> {
  const res = await apiClient.post(API.AUTOMATION.GENERATE_SCRIPT(testCaseId));
  return res.data.data;
}

export async function runTest(testCaseId: string, data: { headless?: boolean }): Promise<Execution> {
  const res = await apiClient.post(API.AUTOMATION.RUN(testCaseId), data);
  return res.data.data;
}
