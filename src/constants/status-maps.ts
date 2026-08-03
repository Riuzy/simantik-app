import type { MantineColor } from '@mantine/core';
import type { TestPriority, TestCaseStatus, TestCaseType, TestCaseLastResult } from '../features/test-cases/types';
import type { ExecutionStatus } from '../features/executions/types';
import type { Framework, Browser } from '../features/projects/types';

interface StatusMap<T extends string> {
  color: Record<T, MantineColor>;
  label: Record<T, string>;
}

export const priorityMap: StatusMap<TestPriority> = {
  color: { LOW: 'gray', MEDIUM: 'blue', HIGH: 'orange', CRITICAL: 'red' },
  label: { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', CRITICAL: 'Critical' },
};

export const testCaseStatusMap: StatusMap<TestCaseStatus> = {
  color: { DRAFT: 'gray', READY: 'green', ARCHIVED: 'dark' },
  label: { DRAFT: 'Draft', READY: 'Ready', ARCHIVED: 'Archived' },
};

export const testCaseTypeMap: StatusMap<TestCaseType> = {
  color: { MANUAL: 'gray', AUTOMATION: 'violet' },
  label: { MANUAL: 'Manual', AUTOMATION: 'Automation' },
};

export const lastResultMap: StatusMap<TestCaseLastResult> = {
  color: { NOT_RUN: 'gray', RUNNING: 'blue', PASSED: 'green', FAILED: 'red' },
  label: { NOT_RUN: 'Not Run', RUNNING: 'Running', PASSED: 'Passed', FAILED: 'Failed' },
};

export const executionStatusMap: StatusMap<ExecutionStatus> = {
  color: {
    QUEUED: 'gray',
    RUNNING: 'blue',
    PASSED: 'green',
    FAILED: 'red',
    ERROR: 'red',
    CANCELLED: 'gray',
    SKIPPED: 'yellow',
  },
  label: {
    QUEUED: 'Queued',
    RUNNING: 'Running',
    PASSED: 'Passed',
    FAILED: 'Failed',
    ERROR: 'Error',
    CANCELLED: 'Cancelled',
    SKIPPED: 'Skipped',
  },
};

export const frameworkMap: StatusMap<Framework> = {
  color: { PLAYWRIGHT: 'green', SELENIUM: 'orange', CYPRESS: 'violet' },
  label: { PLAYWRIGHT: 'Playwright', SELENIUM: 'Selenium', CYPRESS: 'Cypress' },
};

export const browserMap: StatusMap<Browser> = {
  color: { CHROMIUM: 'blue', FIREFOX: 'orange', WEBKIT: 'violet' },
  label: { CHROMIUM: 'Chromium', FIREFOX: 'Firefox', WEBKIT: 'WebKit' },
};
