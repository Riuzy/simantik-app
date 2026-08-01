import { apiClient } from '../../../services/api-client';
import { API } from '../../../constants/api';
import type { OverviewReport, ProjectReport } from '../types';

export async function getOverview(): Promise<OverviewReport> {
  const res = await apiClient.get(API.REPORTS.OVERVIEW);
  return res.data.data;
}

export async function getProjectReport(projectId: string): Promise<ProjectReport> {
  const res = await apiClient.get(API.REPORTS.PROJECT(projectId));
  return res.data.data;
}
