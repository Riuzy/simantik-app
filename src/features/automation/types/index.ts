export type Browser = 'CHROMIUM' | 'FIREFOX' | 'WEBKIT';
export type Framework = 'PLAYWRIGHT' | 'SELENIUM' | 'CYPRESS';
export type ExecutionStatus = 'RUNNING' | 'PASSED' | 'FAILED' | 'SKIPPED' | 'ERROR';

export interface GeneratedScript {
  testCaseId: string;
  code: string;
  title: string;
  framework: Framework;
  generatorType: 'TEMPLATE' | 'AI';
  provider: string;
  model: string | null;
  script: string;
}

export interface GenerateScriptOptions {
  method?: 'TEMPLATE' | 'AI';
  provider?: string;
  model?: string;
  apiKey?: string;
}

export interface StoredScript {
  testCaseId: string;
  code: string;
  title: string;
  framework: string;
  generatorType: string;
  provider: string | null;
  model: string | null;
  language: string;
  version: string;
  lastRunAt: string | null;
  createdAt: string;
  updatedAt: string;
  script: string;
}

export interface RunExecutionResponse {
  executionId: string;
  status: ExecutionStatus;
  message: string;
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
