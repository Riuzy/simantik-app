export type {
  ILogger,
  IRunner,
  IReporter,
  IArtifactManager,
  IApiClient,
  IExecutionManager,
} from '../core/interfaces';

export type { AutomationJob } from '../core/domain/automation-job';
export type { AutomationContext } from '../core/domain/automation-context';
export type { AutomationResult } from '../core/domain/automation-result';
export type { ExecutionMetadata } from '../core/domain/automation-job';
export type { AttachmentEntry, ErrorEntry, WarningEntry } from '../core/domain/automation-result';
