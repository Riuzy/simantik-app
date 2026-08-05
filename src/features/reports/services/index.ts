import { apiClient } from '../../../services/api-client';
import { API } from '../../../constants/api';
import type { OverviewReport, ProjectReport, ReportDownloadOptions, ReportFormat } from '../types';

export async function getOverview(): Promise<OverviewReport> {
  const res = await apiClient.get(API.REPORTS.OVERVIEW);
  return res.data.data;
}

export async function getProjectReport(projectId: string): Promise<ProjectReport> {
  const res = await apiClient.get(API.REPORTS.PROJECT(projectId));
  return res.data.data;
}

function buildDownloadUrl(projectId: string, format: ReportFormat, options: ReportDownloadOptions): string {
  const base = format === 'pdf'
    ? API.REPORTS.TEST_CASE_REPORT_PDF(projectId)
    : API.REPORTS.TEST_CASE_REPORT_XLSX(projectId);

  const params = new URLSearchParams();
  params.set('summary', String(options.includeSummary));
  params.set('testCase', String(options.includeTestCase));
  params.set('expectedResult', String(options.includeExpectedResult));
  params.set('actualResult', String(options.includeActualResult));
  params.set('status', String(options.includeStatus));
  return `${base}?${params.toString()}`;
}

export async function downloadTestCaseReport(
  projectId: string,
  format: ReportFormat,
  options: ReportDownloadOptions,
  filename: string,
): Promise<void> {
  const res = await apiClient.get(buildDownloadUrl(projectId, format, options), {
    responseType: 'blob',
  });

  const url = URL.createObjectURL(res.data as Blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.${format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
