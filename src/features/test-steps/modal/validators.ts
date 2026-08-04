import { z } from 'zod';
import { TEST_STEP_ACTIONS } from '../../../constants/test-step-actions';

export const locatorItemSchema = z.object({
  strategy: z.string().min(1, 'Strategy is required'),
  value: z.string().min(1, 'Locator value is required'),
});

export const testStepFormSchema = z.object({
  action: z.enum(TEST_STEP_ACTIONS as unknown as [string, ...string[]], {
    message: 'Action is required',
  }),
  description: z.string().optional(),
  locators: z.array(locatorItemSchema).default([]),
  inputValue: z.string().optional(),
  expectedResult: z.string().optional(),
});

export type TestStepFormSchema = z.infer<typeof testStepFormSchema>;

export const fieldValidators = {
  action: (value: string): string | null => {
    if (!value || value.trim().length === 0) return 'Action is required';
    if (!TEST_STEP_ACTIONS.includes(value as typeof TEST_STEP_ACTIONS[number])) {
      return 'Invalid action';
    }
    return null;
  },
  locator: (value: string): string | null => {
    return null;
  },
  expectedResult: (value: string, action: string): string | null => {
    if (action === 'VERIFY_TEXT' && (!value || value.trim().length === 0)) {
      return 'Expected result is required for verification actions';
    }
    return null;
  },
};