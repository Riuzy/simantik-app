'use client';

import { ReactNode } from 'react';
import { Table, Skeleton, Group, TableProps } from '@mantine/core';
import { IconChevronUp, IconChevronDown } from '@tabler/icons-react';
import { EmptyState } from './empty-state';

export interface SortConfig {
  column: string;
  order: 'asc' | 'desc';
}

export interface DataTableColumn {
  key: string;
  label?: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

interface DataTableProps extends Omit<TableProps, 'children'> {
  columns: DataTableColumn[];
  rows: ReactNode;
  loading?: boolean;
  rowCount?: number;
  minHeight?: number;
  sort?: SortConfig;
  onSort?: (column: string) => void;
}

export function DataTable({
  columns,
  rows,
  loading = false,
  rowCount = 8,
  minHeight = 240,
  sort,
  onSort,
  ...props
}: DataTableProps) {
  if (loading) {
    return (
      <div style={{ minHeight }}>
        {Array.from({ length: Math.min(rowCount, 8) }, (_, i) => (
          <Group key={i} gap="md" px="md" py={8} wrap="nowrap">
            <Skeleton height={14} radius="sm" width="12%" />
            <Skeleton height={14} radius="sm" width="30%" />
            <Skeleton height={14} radius="sm" width="18%" />
            <Skeleton height={14} radius="sm" width="14%" />
            <Skeleton height={14} radius="sm" width="26%" />
          </Group>
        ))}
      </div>
    );
  }

  return (
    <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="sm" {...props}>
      <Table.Thead>
        <Table.Tr>
          {columns.map((column) =>
            column.sortable && sort && onSort ? (
              <SortableTh
                key={column.key}
                label={column.label ?? ''}
                column={column.key}
                sort={sort}
                onSort={onSort}
                align={column.align}
                width={column.width}
              />
            ) : (
              <Table.Th key={column.key} w={column.width} align={column.align}>
                {column.label ?? ''}
              </Table.Th>
            ),
          )}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
}

export function EmptyTableRow({ colSpan, message, description }: { colSpan: number; message: string; description?: string }) {
  return (
    <Table.Tr>
      <Table.Td colSpan={colSpan} py={48}>
        <EmptyState title={message} description={description} compact />
      </Table.Td>
    </Table.Tr>
  );
}

interface SortableThProps {
  label: string;
  column: string;
  sort: SortConfig;
  onSort: (column: string) => void;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
}

export function SortableTh({ label, column, sort, onSort, align = 'left', width }: SortableThProps) {
  const active = sort.column === column;
  return (
    <Table.Th
      onClick={() => onSort(column)}
      align={align}
      w={width}
      style={{ cursor: 'pointer', userSelect: 'none' }}
    >
      <Group gap={4} wrap="nowrap" justify={align === 'right' ? 'flex-end' : 'flex-start'}>
        {label}
        {active ? (
          sort.order === 'asc' ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />
        ) : (
          <IconChevronDown size={12} style={{ opacity: 0.25 }} />
        )}
      </Group>
    </Table.Th>
  );
}
