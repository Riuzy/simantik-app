export type ExecutionStatus = 'QUEUED' | 'RUNNING' | 'PASSED' | 'FAILED' | 'SKIPPED' | 'ERROR' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

export interface TestCaseSummary {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  module?: string | null;
  priority?: string | null;
  status?: string | null;
  tags?: string[] | null;
  createdAt?: string | null;
  createdBy?: User | null;
}

export interface ProjectSummary {
  id: string;
  code: string;
  name: string;
  slug: string;
  baseUrl?: string | null;
  framework?: string | null;
  environment?: string | null;
  createdBy?: User | null;
}

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
  testCase: TestCaseSummary;
  project: ProjectSummary;
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

export interface RunExecutionResponse {
  executionId: string;
  status: ExecutionStatus;
  message: string;
}

export interface ListExecutionsParams {
  projectId?: string;
  testCaseId?: string;
  status?: ExecutionStatus;
  search?: string;
  page?: number;
  limit?: number;
}
