'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useForm, type UseFormReturnType } from '@mantine/form';
import type { TestStepModalMode, TestStepData, TestStepFormValues } from './types';

interface UseTestStepModalOptions {
  mode: TestStepModalMode;
  initialStep?: TestStepData | null;
  opened: boolean;
}

interface UseTestStepModalReturn {
  form: UseFormReturnType<TestStepFormValues>;
  isOpen: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  resetForm: () => void;
  getTitle: () => string;
  getSubmitLabel: () => string;
}

export const DEFAULT_STEP_VALUES: TestStepFormValues = {
  action: '',
  description: '',
  locators: [],
  inputValue: '',
  expectedResult: '',
};

export function buildInitialValues(step: TestStepData | null | undefined): TestStepFormValues {
  if (!step) return { ...DEFAULT_STEP_VALUES };

  const locators =
    step.locators && step.locators.length > 0
      ? step.locators.filter((l) => l.strategy && l.value)
      : step.locatorStrategy && step.locatorValue
        ? [{ strategy: step.locatorStrategy, value: step.locatorValue }]
        : [];

  return {
    action: step.action ?? '',
    description: step.description ?? '',
    locators,
    inputValue: step.inputValue ?? '',
    expectedResult: step.expectedResult ?? '',
  };
}

export function useTestStepModal({
  mode,
  initialStep,
  opened,
}: UseTestStepModalOptions): UseTestStepModalReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modeRef = useRef(mode);
  const lastSessionRef = useRef<string | null>(null);

  const form = useForm<TestStepFormValues>({
    initialValues: { ...DEFAULT_STEP_VALUES },
    validateInputOnChange: true,
    validateInputOnBlur: true,
    validate: {
      action: (value) =>
        !value || String(value).trim().length === 0 ? 'Action is required' : null,
      description: () => null,
      inputValue: () => null,
      expectedResult: (value, values) => {
        if (String(values.action).startsWith('VERIFY_') && (!value || String(value).trim().length === 0)) {
          return 'Expected result is required for verification actions';
        }
        return null;
      },
      locators: () => null,
    },
  });

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const sessionKey = opened ? `${initialStep?.id ?? 'create'}-${mode}` : 'closed';

  useEffect(() => {
    if (sessionKey === lastSessionRef.current) return;
    lastSessionRef.current = sessionKey;

    const values =
      opened
        ? (modeRef.current === 'create'
            ? { ...DEFAULT_STEP_VALUES }
            : buildInitialValues(initialStep))
        : { ...DEFAULT_STEP_VALUES };

    form.setValues(values);
    form.resetDirty(values);

    if (!opened) {
      form.clearErrors();
      setIsSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKey, opened]);

  const resetForm = useCallback(() => {
    form.setValues({ ...DEFAULT_STEP_VALUES });
    form.resetDirty({ ...DEFAULT_STEP_VALUES });
    form.clearErrors();
    setIsSubmitting(false);
  }, [form]);

  const getTitle = useMemo(() => {
    return () => {
      switch (modeRef.current) {
        case 'create': return 'Add Test Step';
        case 'edit': return 'Edit Test Step';
        case 'duplicate': return 'Duplicate Test Step';
        case 'copy': return 'Copy Test Step';
        case 'preview': return 'Preview Test Step';
        default: return 'Test Step';
      }
    };
  }, []);

  const getSubmitLabel = useMemo(() => {
    return () => {
      switch (modeRef.current) {
        case 'create': return 'Add Step';
        case 'edit': return 'Save Changes';
        case 'duplicate': return 'Duplicate';
        case 'copy': return 'Copy';
        case 'preview': return 'Close';
        default: return 'Save';
      }
    };
  }, []);

  return {
    form,
    isOpen: opened,
    isDirty: form.isDirty(),
    isSubmitting,
    resetForm,
    getTitle,
    getSubmitLabel,
  };
}
