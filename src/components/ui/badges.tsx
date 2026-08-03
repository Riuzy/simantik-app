'use client';

import { Badge, BadgeProps } from '@mantine/core';
import {
  priorityMap,
  testCaseStatusMap,
  testCaseTypeMap,
  lastResultMap,
  executionStatusMap,
  frameworkMap,
  browserMap,
} from '../../constants/status-maps';
import type { TestPriority, TestCaseStatus, TestCaseType, TestCaseLastResult } from '../../features/test-cases/types';
import type { ExecutionStatus } from '../../features/executions/types';
import type { Framework, Browser } from '../../features/projects/types';

interface BadgeComponentProps extends Omit<BadgeProps, 'color' | 'children'> {
  size?: BadgeProps['size'];
}

export function PriorityBadge({ value, ...props }: BadgeComponentProps & { value: TestPriority }) {
  return (
    <Badge color={priorityMap.color[value]} {...props}>
      {priorityMap.label[value]}
    </Badge>
  );
}

export function TestCaseStatusBadge({ value, ...props }: BadgeComponentProps & { value: TestCaseStatus }) {
  return (
    <Badge color={testCaseStatusMap.color[value]} {...props}>
      {testCaseStatusMap.label[value]}
    </Badge>
  );
}

export function TestCaseTypeBadge({ value, ...props }: BadgeComponentProps & { value: TestCaseType }) {
  return (
    <Badge color={testCaseTypeMap.color[value]} {...props}>
      {testCaseTypeMap.label[value]}
    </Badge>
  );
}

export function LastResultBadge({ value, ...props }: BadgeComponentProps & { value: TestCaseLastResult }) {
  return (
    <Badge color={lastResultMap.color[value]} variant={value === 'NOT_RUN' ? 'light' : 'dot'} {...props}>
      {lastResultMap.label[value]}
    </Badge>
  );
}

export function ExecutionStatusBadge({ value, ...props }: BadgeComponentProps & { value: ExecutionStatus }) {
  const showDot = value === 'RUNNING' || value === 'PASSED' || value === 'FAILED' || value === 'ERROR';
  return (
    <Badge color={executionStatusMap.color[value]} variant={showDot ? 'dot' : 'light'} {...props}>
      {executionStatusMap.label[value]}
    </Badge>
  );
}

export function FrameworkBadge({ value, ...props }: BadgeComponentProps & { value: Framework }) {
  return (
    <Badge color={frameworkMap.color[value]} {...props}>
      {frameworkMap.label[value]}
    </Badge>
  );
}

export function BrowserBadge({ value, ...props }: BadgeComponentProps & { value: Browser }) {
  return (
    <Badge color={browserMap.color[value]} {...props}>
      {browserMap.label[value]}
    </Badge>
  );
}
