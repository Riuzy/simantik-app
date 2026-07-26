import { z } from 'zod';
import { TestRunStatus, ExecutionStatus } from '@prisma/client';
import {
  createTestRunBodySchema,
  updateTestRunBodySchema,
  updateExecutionBodySchema,
  updateExecutionResultBodySchema,
  finishTestRunBodySchema,
  testCaseIdsBodySchema,
  listTestRunsQuerySchema,
  listExecutionsQuerySchema,
} from '../validators/test-execution.validators';

export type CreateTestRunDTO = z.infer<typeof createTestRunBodySchema>;
export type UpdateTestRunDTO = z.infer<typeof updateTestRunBodySchema>;
export type UpdateExecutionDTO = z.infer<typeof updateExecutionBodySchema>;
export type UpdateExecutionResultDTO = z.infer<typeof updateExecutionResultBodySchema>;
export type FinishTestRunDTO = z.infer<typeof finishTestRunBodySchema>;
export type StartTestRunDTO = z.infer<typeof testCaseIdsBodySchema>;
export type ListTestRunsQuery = z.infer<typeof listTestRunsQuerySchema>;
export type ListExecutionsQuery = z.infer<typeof listExecutionsQuerySchema>;

export interface TestRunResponseDTO {
  id: string;
  code: string;
  name: string;
  description: string | null;
  projectId: string;
  executedById: string;
  status: TestRunStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  executedBy: {
    id: string;
    name: string;
    email: string;
  };
  project: {
    id: string;
    code: string;
    name: string;
  };
  _count: {
    executions: number;
  };
  statistics?: ExecutionStatisticsDTO;
}

export interface TestRunListDTO {
  id: string;
  code: string;
  name: string;
  status: TestRunStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  executedBy: {
    id: string;
    name: string;
  };
  project: {
    id: string;
    code: string;
    name: string;
  };
  _count: {
    executions: number;
  };
}

export interface TestRunFilters {
  projectId?: string;
  status?: TestRunStatus;
  executedById?: string;
  search?: string;
  sortBy?: 'createdAt' | 'name' | 'startedAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ExecutionResponseDTO {
  id: string;
  testRunId: string;
  testCaseId: string;
  testerId: string;
  status: ExecutionStatus;
  executedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  testCase: {
    id: string;
    code: string;
    title: string;
    priority: string;
    steps: Array<{
      id: string;
      stepNumber: number;
      action: string;
      expectedResult: string;
    }>;
  };
  tester: {
    id: string;
    name: string;
  };
  result?: {
    id: string;
    actualResult: string | null;
    environment: string | null;
    browser: string | null;
    operatingSystem: string | null;
    device: string | null;
    notes: string | null;
    duration: number | null;
  };
}

export interface ExecutionListDTO {
  id: string;
  testRunId: string;
  testCaseId: string;
  status: ExecutionStatus;
  executedAt: Date | null;
  createdAt: Date;
  testCase: {
    id: string;
    code: string;
    title: string;
    priority: string;
  };
  tester: {
    id: string;
    name: string;
  } | null;
}

export interface ExecutionStatisticsDTO {
  total: number;
  notRun: number;
  passed: number;
  failed: number;
  blocked: number;
  skipped: number;
  passRate: number;
}

export interface TestRunStatisticsDTO {
  testRun: {
    id: string;
    code: string;
    name: string;
    status: TestRunStatus;
    startedAt: Date | null;
    completedAt: Date | null;
  };
  executions: ExecutionStatisticsDTO;
}

export interface PaginationDTO {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ExecutionListResponseDTO {
  data: ExecutionListDTO[];
  pagination: PaginationDTO;
}

export interface TestRunListResponseDTO {
  data: TestRunListDTO[];
  pagination: PaginationDTO;
}
