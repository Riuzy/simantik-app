import type { TestStepAction } from '../../../constants/test-step-actions';

export type TestStepModalMode = 'create' | 'edit' | 'duplicate' | 'copy' | 'preview';

export interface TestStepModalProps {
  testCaseId: string;
  mode: TestStepModalMode;
  stepNumber?: number;
  initialStep?: TestStepData | null;
  onClose: () => void;
  onSave?: (stepNumber: number) => void;
}

export interface TestStepData {
  id?: string;
  stepNumber: number;
  action: TestStepAction;
  description: string | null;
  locatorStrategy: string | null;
  locatorValue: string | null;
  locators: LocatorItem[] | null;
  inputValue: string | null;
  expectedResult: string | null;
}

export interface LocatorItem {
  strategy: string;
  value: string;
}

export interface TestStepFormValues {
  action: TestStepAction | '';
  description: string;
  locators: LocatorItem[];
  inputValue: string;
  expectedResult: string;
}

export interface TestStepModalState {
  isOpen: boolean;
  mode: TestStepModalMode;
  stepNumber?: number;
  initialStep?: TestStepData | null;
  isSubmitting: boolean;
  isDirty: boolean;
  validationErrors: Record<string, string>;
}
