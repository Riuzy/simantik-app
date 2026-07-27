import { ExecutionStatus } from './enums';

export interface AttachmentEntry {
  name: string;
  path: string;
  mimeType: string;
  size: number;
}

export interface ErrorEntry {
  message: string;
  code?: string;
  stack?: string;
  step?: number;
}

export interface WarningEntry {
  message: string;
  code?: string;
  step?: number;
}

export class AutomationResult {
  public readonly errors: ErrorEntry[] = [];
  public readonly warnings: WarningEntry[] = [];
  public readonly attachments: AttachmentEntry[] = [];
  public passed = 0;
  public failed = 0;
  public skipped = 0;

  constructor(
    public readonly jobId: string,
    public readonly executionId: string,
    public status: ExecutionStatus = ExecutionStatus.PENDING,
    public startTime: Date | null = null,
    public finishTime: Date | null = null,
    public duration: number | null = null,
    public summary: string | null = null,
  ) {}

  succeed(): void {
    this.status = ExecutionStatus.PASSED;
    this.finishTime = new Date();
    this._calculateDuration();
  }

  fail(error: ErrorEntry): void {
    this.status = ExecutionStatus.FAILED;
    this.errors.push(error);
    this.finishTime = new Date();
    this._calculateDuration();
  }

  cancel(): void {
    this.status = ExecutionStatus.CANCELLED;
    this.finishTime = new Date();
    this._calculateDuration();
  }

  skip(reason?: string): void {
    this.status = ExecutionStatus.SKIPPED;
    this.skipped++;
    if (reason) {
      this.warnings.push({ message: reason, code: 'SKIPPED' });
    }
  }

  addAttachment(attachment: AttachmentEntry): void {
    this.attachments.push(attachment);
  }

  addWarning(warning: WarningEntry): void {
    this.warnings.push(warning);
  }

  private _calculateDuration(): void {
    if (this.startTime && this.finishTime) {
      this.duration = this.finishTime.getTime() - this.startTime.getTime();
    }
  }
}
