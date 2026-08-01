export interface ExecutionStatusCount {
  PASSED: number;
  FAILED: number;
  ERROR: number;
  SKIPPED: number;
  RUNNING: number;
}

export interface RecentExecution {
  id: string;
  number: string;
  status: string;
  durationMs: number | null;
  createdAt: string;
  testCase: { id: string; code: string; title: string };
  project: { id: string; slug: string; name: string };
}

export interface OverviewReport {
  totalProjects: number;
  totalTestCases: number;
  totalExecutions: number;
  executionStatus: ExecutionStatusCount;
  recentExecutions: RecentExecution[];
}

export interface ProjectReport {
  project: {
    id: string;
    code: string;
    name: string;
    slug: string;
    status: string;
    createdAt: string;
  };
  totalTestCases: number;
  totalExecutions: number;
  executionStatus: ExecutionStatusCount;
  recentExecutions: RecentExecution[];
}
