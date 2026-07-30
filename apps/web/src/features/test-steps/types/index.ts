export interface TestStep {
  id: string;
  testCaseId: string;
  stepNumber: number;
  action: string;
  expectedResult: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestStepForm {
  action: string;
  expectedResult: string;
  stepNumber?: number;
}

export interface UpdateTestStepForm {
  action?: string;
  expectedResult?: string;
}

export interface ReorderStepsForm {
  stepIds: string[];
}
