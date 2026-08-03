'use client';

import { Paper, Text } from '@mantine/core';

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  description?: string;
  icon?: React.ReactNode;
  color?: string;
}

export function StatCard({ title, value, description, icon, color = 'blue' }: StatCardProps) {
  return (
    <Paper p="md" radius="md" withBorder style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ minWidth: 0 }}>
        <Text size="xs" c="dimmed" tt="uppercase" fw={600} lh={1}>{title}</Text>
        <Text fz={24} fw={700} mt={6} style={{ lineHeight: 1.2 }}>{value}</Text>
        {description && (
          <Text size="xs" c="dimmed" mt={4} lineClamp={1}>{description}</Text>
        )}
      </div>
      {icon && (
        <Paper p="sm" radius="md" variant="light" style={{ color: `var(--mantine-color-${color}-6)`, alignSelf: 'center' }}>
          {icon}
        </Paper>
      )}
    </Paper>
  );
}
