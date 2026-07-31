export type ExecutionStatus = 'RUNNING' | 'PASSED' | 'FAILED' | 'SKIPPED' | 'ERROR';

export interface ExecutionLog {
  id: string;
  executionId: string;
  stepNumber: number | null;
  action: string | null;
  level: string;
  message: string;
  timestamp: string;
}

export interface Execution {
  id: string;
  number: string;
  projectId: string;
  testCaseId: string;
  status: ExecutionStatus;
  durationMs: number | null;
  startedAt: string | null;
  finishedAt: string | null;
  browser: string | null;
  environment: string | null;
  screenshotPath: string | null;
  videoPath: string | null;
  tracePath: string | null;
  generatedScript: string | null;
  consoleLog: string | null;
  error: string | null;
  createdAt: string;
  testCase: { id: string; code: string; title: string };
  project: { id: string; code: string; name: string; slug: string };
  logs?: ExecutionLog[];
}

export interface ExecutionListResponse {
  data: Execution[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListExecutionsParams {
  projectId?: string;
  testCaseId?: string;
  status?: ExecutionStatus;
  search?: string;
  page?: number;
  limit?: number;
}
