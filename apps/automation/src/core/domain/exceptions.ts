export class AutomationException extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    Object.setPrototypeOf(this, AutomationException.prototype);
  }
}

export class ExecutionException extends AutomationException {
  constructor(message: string, executionId?: string, details?: unknown) {
    super(
      'EXECUTION_ERROR',
      executionId ? `[${executionId}] ${message}` : message,
      details,
    );
  }
}

export class ConfigurationException extends AutomationException {
  constructor(message: string, details?: unknown) {
    super('CONFIGURATION_ERROR', message, details);
  }
}

export class RunnerException extends AutomationException {
  constructor(message: string, runnerName?: string, details?: unknown) {
    super(
      'RUNNER_ERROR',
      runnerName ? `[${runnerName}] ${message}` : message,
      details,
    );
  }
}

export class ValidationException extends AutomationException {
  constructor(message: string, details?: unknown) {
    super('VALIDATION_ERROR', message, details);
  }
}
