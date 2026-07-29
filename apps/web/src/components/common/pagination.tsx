import { Group, Pagination as MantinePagination, Text } from '@mantine/core';

interface Props {
  page: number;
  total: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, total, totalPages, onChange }: Props) {
  return (
    <Group justify="space-between" mt="md">
      <Text size="sm" c="dimmed">Total: {total} items</Text>
      <MantinePagination total={totalPages} value={page} onChange={onChange} />
    </Group>
  );
}
