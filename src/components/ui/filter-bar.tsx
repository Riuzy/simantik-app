'use client';

import { ReactNode } from 'react';
import { Paper, Box } from '@mantine/core';

interface FilterBarProps {
  children: ReactNode;
  mb?: string | number;
}

export function FilterBar({ children, mb = 'md' }: FilterBarProps) {
  return (
    <Paper p="sm" withBorder mb={mb}>
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          alignItems: 'end',
        }}
      >
        {children}
      </Box>
    </Paper>
  );
}
