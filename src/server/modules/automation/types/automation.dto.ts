import { z } from 'zod';
import {
  upsertAutomationConfigBodySchema,
  runTestBodySchema,
} from '../validators/automation.validators';
import { Browser, ExecutionStatus, Framework } from '@prisma/client';

export type UpsertAutomationConfigDTO = z.infer<typeof upsertAutomationConfigBodySchema>;
export type RunTestDTO = z.infer<typeof runTestBodySchema>;

export interface AutomationConfigResponseDTO {
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
