import { z } from 'zod';
import { runTestBodySchema, generateScriptBodySchema } from '../validators/automation.validators';
import { ExecutionStatus, Framework } from '@prisma/client';

export type RunTestDTO = z.infer<typeof runTestBodySchema>;
export type GenerateScriptDTO = z.infer<typeof generateScriptBodySchema>;

export interface GeneratedScriptDTO {
  testCaseId: string;
  code: string;
  title: string;
  framework: Framework;
}

export interface ExecutionResponseDTO {
  id: string;
  number: string;
  projectId: string;
  testCaseId: string;
  status: ExecutionStatus;
  durationMs: number | null;
  startedAt: Date | null;
  finishedAt: Date | null;
  browser: string | null;
  environment: string | null;
  screenshotPath: string | null;
  videoPath: string | null;
  tracePath: string | null;
  generatedScript: string | null;
  createdAt: Date;
}

export interface RunExecutionResponseDTO {
  executionId: string;
  status: ExecutionStatus;
  message: string;
}