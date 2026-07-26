import { z } from 'zod';
import { TestPriority, TestCaseStatus } from '@prisma/client';
import {
  createTestCaseBodySchema,
  updateTestCaseBodySchema,
  createStepBodySchema,
  updateStepBodySchema,
  duplicateBodySchema,
  cloneBodySchema,
  listTestCasesQuerySchema,
} from '../validators/test-case.validators';

export type CreateTestCaseDTO = z.infer<typeof createTestCaseBodySchema>;
export type UpdateTestCaseDTO = z.infer<typeof updateTestCaseBodySchema>;
export type CreateTestStepDTO = z.infer<typeof createStepBodySchema>;
export type UpdateTestStepDTO = z.infer<typeof updateStepBodySchema>;
export type DuplicateTestCaseDTO = z.infer<typeof duplicateBodySchema>;
export type CloneTestCaseDTO = z.infer<typeof cloneBodySchema>;
export type ListTestCasesQuery = z.infer<typeof listTestCasesQuerySchema>;

export interface TestStepResponseDTO {
  id: string;
  testCaseId: string;
  stepNumber: number;
  action: string;
  expectedResult: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestCaseResponseDTO {
  id: string;
  code: string;
  title: string;
  description: string | null;
  precondition: string | null;
  priority: TestPriority;
  status: TestCaseStatus;
  projectId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  project: {
    id: string;
    code: string;
    name: string;
  };
  steps: TestStepResponseDTO[];
}

export interface TestCaseListDTO {
  id: string;
  code: string;
  title: string;
  priority: TestPriority;
  status: TestCaseStatus;
  createdAt: Date;
  createdBy: {
    id: string;
    name: string;
  };
  project: {
    id: string;
    code: string;
    name: string;
  };
  _count: {
    steps: number;
  };
}

export interface PaginationDTO {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TestCaseListResponseDTO {
  data: TestCaseListDTO[];
  pagination: PaginationDTO;
}

export interface TestCaseFilters {
  projectId?: string;
  status?: TestCaseStatus;
  priority?: TestPriority;
  createdById?: string;
  search?: string;
  sortBy?: 'createdAt' | 'title' | 'updatedAt' | 'priority';
  sortOrder?: 'asc' | 'desc';
}