'use client';

import type { ReactNode } from 'react';
import { Paper, Title, Text, Group, Box } from '@mantine/core';

interface SettingsSectionProps {
  icon: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
}

export function SettingsSection({ icon, title, description, children }: SettingsSectionProps) {
  return (
    <Paper p="lg" withBorder>
      <Group gap="sm" mb="lg" align="flex-start" wrap="nowrap">
        <Box style={{ color: 'var(--mantine-color-dimmed)', display: 'flex', marginTop: 2 }}>{icon}</Box>
        <Box>
          <Title order={4}>{title}</Title>
          {description && (
            <Text size="sm" c="dimmed" mt={2}>
              {description}
            </Text>
          )}
        </Box>
      </Group>
      {children}
    </Paper>
  );
}