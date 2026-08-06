'use client';

import { Group, Text, ThemeIcon, Stack, Box, useMantineColorScheme } from '@mantine/core';
import { IconFlame } from '@tabler/icons-react';

interface BrandProps {
  showSubtitle?: boolean;
}

export function Brand({ showSubtitle = true }: BrandProps) {
  const { colorScheme } = useMantineColorScheme();
  
  return (
    <Group gap="sm" wrap="nowrap">
      <ThemeIcon size={40} radius="md" variant="light" color="blue">
        <IconFlame size={24} stroke={1.8} />
      </ThemeIcon>
      <Stack gap={2}>
        <Text fw={700} fz={18} style={{ letterSpacing: '-0.02em', lineHeight: 1 }}>
          SIMANTIK
        </Text>
        {showSubtitle && (
          <Text size="xs" c="dimmed" fw={500} style={{ lineHeight: 1 }}>
            Software Testing Management System
          </Text>
        )}
      </Stack>
    </Group>
  );
}
