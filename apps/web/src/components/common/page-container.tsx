'use client';

import { Container, Paper, type PaperProps } from '@mantine/core';
import { ReactNode } from 'react';

interface Props extends PaperProps {
  children: ReactNode;
}

export function PageContainer({ children, ...props }: Props) {
  return (
    <Container size="xl" py="md">
      <Paper p="lg" shadow="sm" radius="md" {...props}>
        {children}
      </Paper>
    </Container>
  );
}
