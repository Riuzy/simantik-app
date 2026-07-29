import { Badge } from '@mantine/core';

interface Props {
  status: string;
  color?: string;
}

const statusColors: Record<string, string> = {
  ACTIVE: 'green',
  PASSED: 'green',
  COMPLETED: 'blue',
  IN_PROGRESS: 'yellow',
  FAILED: 'red',
  PENDING: 'gray',
  DRAFT: 'gray',
  PLANNED: 'gray',
  CANCELLED: 'red',
  RESOLVED: 'green',
  CLOSED: 'blue',
  REOPENED: 'yellow',
  OPEN: 'orange',
  BLOCKED: 'red',
  SKIPPED: 'yellow',
  NOT_RUN: 'gray',
};

export function StatusBadge({ status, color }: Props) {
  return (
    <Badge color={color || statusColors[status] || 'gray'} variant="light" size="sm">
      {status}
    </Badge>
  );
}
