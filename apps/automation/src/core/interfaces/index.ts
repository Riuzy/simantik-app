import type { AutomationJob } from '../domain/automation-job';
import type { AutomationContext } from '../domain/automation-context';
import type { AutomationResult } from '../domain/automation-result';

export interface ILogger {
  info(obj: unknown, msg?: string): void;
  error(obj: unknown, msg?: string): void;
  warn(obj: unknown, msg?: string): void;
  debug(obj: unknown, msg?: string): void;
  child(bindings: Record<string, unknown>): ILogger;
}

export interface IRunner {
  readonly name: string;
  canHandle(job: AutomationJob): boolean;
  initialize(): Promise<void>;
  launch(job: AutomationJob): Promise<void>;
  execute(context: AutomationContext, result: AutomationResult): Promise<AutomationResult>;
  stop(): Promise<void>;
  cancel(jobId: string): Promise<void>;
  cleanup(job: AutomationJob): Promise<void>;
  dispose(): Promise<void>;
}

export interface IReporter {
  report(result: AutomationResult): Promise<void>;
  reportBatch(results: AutomationResult[]): Promise<void>;
  generateSummary(): Promise<void>;
}

export interface IArtifactManager {
  saveScreenshot(executionId: string, buffer: Buffer, name?: string): Promise<ArtifactMetadataType>;
  saveVideo(executionId: string, buffer: Buffer): Promise<ArtifactMetadataType>;
  saveTrace(executionId: string, buffer: Buffer): Promise<ArtifactMetadataType>;
  saveConsoleLog(executionId: string, content: string): Promise<ArtifactMetadataType>;
  saveExecutionLog(executionId: string, content: string): Promise<ArtifactMetadataType>;
  read(executionId: string, relativePath: string): Promise<Buffer | null>;
  deleteArtifact(executionId: string, relativePath: string): Promise<void>;
  cleanup(executionId: string): Promise<void>;
}

type ArtifactMetadataType = import('../../artifacts/artifact-types').ArtifactMetadata;

export interface IApiClient {
  get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  patch<T>(path: string, body?: unknown): Promise<T>;
  delete(path: string): Promise<void>;
}

export interface IExecutionManager {
  initialize(): Promise<void>;
  prepare(job: AutomationJob): Promise<AutomationContext>;
  execute(context: AutomationContext, result: AutomationResult): Promise<AutomationResult>;
  finish(context: AutomationContext, result: AutomationResult): Promise<void>;
  cancel(executionId: string): Promise<void>;
  fail(executionId: string, error: Error): Promise<void>;
  cleanup(context: AutomationContext): Promise<void>;
}

