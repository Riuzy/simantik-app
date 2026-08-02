export type Browser = 'CHROMIUM' | 'FIREFOX' | 'WEBKIT';
export type Framework = 'PLAYWRIGHT' | 'SELENIUM' | 'CYPRESS';
export type ExecutionStatus = 'RUNNING' | 'PASSED' | 'FAILED' | 'SKIPPED' | 'ERROR';

export interface AutomationConfig {
  id: string;
  projectId: string;
  framework: Framework;
  browser: Browser;
  baseUrl: string | null;
  headless: boolean;
  viewportWidth: number;
  viewportHeight: number;
  timeout: number;
  retry: number;
  parallel: number;
  slowMotion: number;
}

export interface GeneratedScript {
  testCaseId: string;
  code: string;
  title: string;
  framework: Framework;
  script: string;
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
  testCase?: { id: string; code: string; title: string };
  project?: { id: string; code: string; name: string; slug: string };
  logs?: ExecutionLog[];
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

export interface UpsertAutomationConfigForm {
  framework?: Framework;
  browser?: Browser;
  baseUrl?: string | null;
  headless?: boolean;
  viewportWidth?: number;
  viewportHeight?: number;
  timeout?: number;
  retry?: number;
  parallel?: number;
  slowMotion?: number;
}
