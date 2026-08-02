import { apiClient } from '../../../services/api-client';
import { API } from '../../../constants/api';
import type { Execution, ExecutionListResponse, ExecutionLog, ListExecutionsParams } from '../types';

export async function listExecutions(params?: ListExecutionsParams): Promise<ExecutionListResponse> {
  const res = await apiClient.get(API.EXECUTIONS.BASE, { params });
  return { data: res.data.data, pagination: res.data.meta };
}

export async function getExecution(id: string): Promise<Execution> {
  const res = await apiClient.get(API.EXECUTIONS.DETAIL(id));
  return res.data.data;
}

export async function getExecutionLogs(id: string): Promise<ExecutionLog[]> {
  const res = await apiClient.get(API.EXECUTIONS.LOGS(id));
  return res.data.data;
}

export async function retryExecution(executionId: string, body: Record<string, unknown>): Promise<Execution> {
  const res = await apiClient.post(API.EXECUTIONS.BASE + '/' + executionId + '/retry', body);
  return res.data.data;
}

export async function deleteExecution(id: string): Promise<void> {
  await apiClient.delete(API.EXECUTIONS.DETAIL(id));
}
