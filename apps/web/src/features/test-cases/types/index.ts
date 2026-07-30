export type TestStepAction =
  | 'OPEN_BROWSER'
  | 'NAVIGATE'
  | 'CLICK'
  | 'DOUBLE_CLICK'
  | 'INPUT_TEXT'
  | 'CLEAR'
  | 'SELECT'
  | 'CHECK'
  | 'UNCHECK'
  | 'UPLOAD_FILE'
  | 'PRESS_KEY'
  | 'WAIT'
  | 'SCROLL'
  | 'HOVER'
  | 'VERIFY_TEXT'
  | 'VERIFY_URL'
  | 'VERIFY_ELEMENT'
  | 'VERIFY_ATTRIBUTE'
  | 'TAKE_SCREENSHOT';

export interface TestCaseStep {
  id: string;
  testCaseId: string;
  stepNumber: number;
  action: TestStepAction;
  target: string | null;
  value: string | null;
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
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  testType: 'MANUAL' | 'AUTOMATION';
  status: 'DRAFT' | 'READY' | 'OBSOLETE';
  projectId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; name: string };
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
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  testType: 'MANUAL' | 'AUTOMATION';
  projectId: string;
}

export interface UpdateTestCaseForm {
  title?: string;
  description?: string;
  module?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  testType?: 'MANUAL' | 'AUTOMATION';
  status?: 'DRAFT' | 'READY' | 'OBSOLETE';
}

export interface CreateTestStepForm {
  action: TestStepAction;
  target?: string;
  value?: string;
  expectedResult?: string;
}

export interface UpdateTestStepForm {
  action?: TestStepAction;
  target?: string;
  value?: string;
  expectedResult?: string;
}