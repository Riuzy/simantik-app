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
  reorderStepsBodySchema,
} from '../validators/test-case.validators';

export type CreateTestCaseDTO = z.infer<typeof createTestCaseBodySchema>;
export type UpdateTestCaseDTO = z.infer<typeof updateTestCaseBodySchema>;
export type CreateTestStepDTO = z.infer<typeof createStepBodySchema>;
export type UpdateTestStepDTO = z.infer<typeof updateStepBodySchema>;
export type DuplicateTestCaseDTO = z.infer<typeof duplicateBodySchema>;
export type CloneTestCaseDTO = z.infer<typeof cloneBodySchema>;
export type ListTestCasesQuery = z.infer<typeof listTestCasesQuerySchema>;
export type ReorderStepsDTO = z.infer<typeof reorderStepsBodySchema>;

export interface TestStepResponseDTO {
  id: string;
  testCaseId: string;
  stepNumber: number;
  action: string;
  description: string | null;
  locatorStrategy: string | null;
  locatorValue: string | null;
  inputValue: string | null;
  expectedResult: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestCaseResponseDTO {
  id: string;
  code: string;
  title: string;
  description: string | null;
  module: string | null;
  priority: TestPriority;
  status: TestCaseStatus;
  tags: string[];
  projectId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
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
  module: string | null;
  priority: TestPriority;
  status: TestCaseStatus;
  tags: string[];
  createdAt: Date;
  createdBy: {
    id: string;
    name: string;
  };
  project: {
    id: string;
    code: string;
    name: string;
    slug: string;
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
  priority?: TestPriority;
  status?: TestCaseStatus;
  tag?: string;
  createdById?: string;
  search?: string;
  sortBy?: 'createdAt' | 'title' | 'updatedAt' | 'priority' | 'code' | 'status' | 'project';
  sortOrder?: 'asc' | 'desc';
}
