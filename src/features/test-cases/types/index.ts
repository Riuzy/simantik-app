import { TEST_STEP_ACTIONS } from '../../../constants/test-step-actions';

export type TestStepAction = (typeof TEST_STEP_ACTIONS)[number];

export type TestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TestCaseStatus = 'DRAFT' | 'READY' | 'ARCHIVED';

export interface TestCaseStep {
  id: string;
  testCaseId: string;
  stepNumber: number;
  action: TestStepAction;
  description: string | null;
  locatorStrategy: string | null;
  locatorValue: string | null;
  inputValue: string | null;
  expectedResult: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TestCase {
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
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; name: string; email?: string; avatar?: string | null };
  project?: { id: string; code: string; name: string; slug?: string };
  steps?: TestCaseStep[];
  _count?: { steps: number };
}

export interface TestCaseListResponse {
  data: TestCase[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateTestCaseForm {
  title: string;
  description?: string;
  module?: string;
  priority: TestPriority;
  status?: TestCaseStatus;
  tags?: string[];
  projectId: string;
}

export interface UpdateTestCaseForm {
  title?: string;
  description?: string;
  module?: string;
  priority?: TestPriority;
  status?: TestCaseStatus;
  tags?: string[];
}

export interface TestStepFields {
  action: TestStepAction;
  description?: string;
  locatorStrategy?: string;
  locatorValue?: string;
  inputValue?: string;
  expectedResult?: string;
}

export type CreateTestStepForm = TestStepFields;
export type UpdateTestStepForm = Partial<TestStepFields>;
