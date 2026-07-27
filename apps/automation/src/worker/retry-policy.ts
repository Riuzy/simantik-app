export interface RetryContext {
  attempt: number;
  maxRetries: number;
  lastError: Error | null;
  jobId: string;
}

export type RetryCondition = (context: RetryContext) => boolean;

export class RetryPolicy {
  public readonly maxRetries: number;
  public readonly baseDelayMs: number;
  public readonly useExponentialBackoff: boolean;
  private _condition: RetryCondition;

  constructor(options: {
    maxRetries?: number;
    baseDelayMs?: number;
    useExponentialBackoff?: boolean;
    condition?: RetryCondition;
  }) {
    this.maxRetries = options.maxRetries ?? 3;
    this.baseDelayMs = options.baseDelayMs ?? 1000;
    this.useExponentialBackoff = options.useExponentialBackoff ?? true;
    this._condition = options.condition ?? (() => true);
  }

  shouldRetry(context: RetryContext): boolean {
    if (context.attempt >= this.maxRetries) return false;
    return this._condition(context);
  }

  getDelayMs(attempt: number): number {
    if (this.useExponentialBackoff) {
      return this.baseDelayMs * Math.pow(2, attempt - 1);
    }
    return this.baseDelayMs;
  }

  async wait(attempt: number): Promise<void> {
    const delay = this.getDelayMs(attempt);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}
