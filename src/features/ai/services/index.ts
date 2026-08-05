import { apiClient } from '../../../services/api-client';
import { API } from '../../../constants/api';
import { AIProvider, AISettings, PromptTemplates, SaveAISettingsForm, TestConnectionForm, TestConnectionResult } from '../types';

export async function getAISettings(): Promise<AISettings> {
  const res = await apiClient.get(API.AI.SETTINGS);
  return res.data.data;
}

export async function saveAISettings(data: SaveAISettingsForm): Promise<AISettings> {
  const res = await apiClient.put(API.AI.SETTINGS, data);
  return res.data.data;
}

export async function testConnection(data: TestConnectionForm): Promise<TestConnectionResult> {
  const res = await apiClient.post(API.AI.TEST_CONNECTION, data);
  return res.data.data;
}

export async function getPromptTemplates(): Promise<PromptTemplates> {
  const res = await apiClient.get(API.AI.PROMPT_TEMPLATES);
  return res.data.data;
}

export async function updatePromptTemplate(key: keyof PromptTemplates, content: string): Promise<void> {
  await apiClient.put(API.AI.PROMPT_TEMPLATES, { key, content });
}
