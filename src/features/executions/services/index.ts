import { apiClient } from '../../../services/api-client';
import { API } from '../../../constants/api';
import type { Execution, ExecutionListResponse, ExecutionLog, ListExecutionsParams, RunExecutionResponse } from '../types';

export async function listExecutions(params?: ListExecutionsParams): Promise<ExecutionListResponse> {
  const res = await apiClient.get(API.EXECUTIONS.BASE, { params });
  return { data: res.data.data, pagination: res.data.meta };
}

export async function getExecution(id: string): Promise<Execution> {
  const res = await apiClient.get(API.EXECUTIONS.DETAIL(id));
  if (!res.data?.success) {
    throw new Error(res.data?.message ?? 'Failed to load execution');
  }
  return res.data.data;
}

export async function getExecutionLogs(id: string): Promise<ExecutionLog[]> {
  const res = await apiClient.get(API.EXECUTIONS.LOGS(id));
  return res.data.data;
}

export async function retryExecution(executionId: string, body: Record<string, unknown>): Promise<RunExecutionResponse> {
  const res = await apiClient.post(API.EXECUTIONS.BASE + '/' + executionId + '/retry', body);
  if (!res.data?.success) {
    throw new Error(res.data?.message ?? 'Failed to retry execution');
  }
  return res.data.data;
}

export async function deleteExecution(id: string): Promise<void> {
  await apiClient.delete(API.EXECUTIONS.DETAIL(id));
}
