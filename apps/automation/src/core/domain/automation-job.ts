import { BrowserType, ExecutionStatus } from './enums';

export interface ExecutionMetadata {
  retryAttempt: number;
  maxRetries: number;
  environmentName?: string;
  triggeredBy?: string;
  tags?: string[];
}

export class AutomationJob {
  constructor(
    public readonly id: string,
    public readonly executionId: string,
    public readonly projectId: string,
    public readonly testRunId: string,
    public readonly environment: string,
    public readonly browser: BrowserType,
    public readonly baseUrl: string,
    public readonly variables: Record<string, string>,
    public readonly headless: boolean,
    public readonly createdAt: Date,
    public startedAt: Date | null = null,
    public finishedAt: Date | null = null,
    public status: ExecutionStatus = ExecutionStatus.PENDING,
    public readonly metadata: ExecutionMetadata = {
      retryAttempt: 0,
      maxRetries: 0,
    },
  ) {}

  markStarted(): void {
    this.startedAt = new Date();
    this.status = ExecutionStatus.RUNNING;
  }

  markFinished(status: ExecutionStatus): void {
    this.finishedAt = new Date();
    this.status = status;
  }
}
