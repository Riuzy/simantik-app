import type { TestStepAction } from '../../../constants/test-step-actions';

export interface TestStep {
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

export interface CreateTestStepForm {
  action: TestStepAction;
  description?: string;
  locatorStrategy?: string;
  locatorValue?: string;
  inputValue?: string;
  expectedResult?: string;
  stepNumber?: number;
}

export interface UpdateTestStepForm {
  action?: TestStepAction;
  description?: string;
  locatorStrategy?: string;
  locatorValue?: string;
  inputValue?: string;
  expectedResult?: string;
}

export interface ReorderStepsForm {
  stepIds: string[];
}
