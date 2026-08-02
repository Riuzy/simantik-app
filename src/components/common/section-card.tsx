'use client';

import { Card, type CardProps } from '@mantine/core';
import { ReactNode } from 'react';

interface Props extends CardProps {
  children: ReactNode;
}

export function SectionCard({ children, ...props }: Props) {
  return (
    <Card shadow="sm" radius="md" p="lg" withBorder {...props}>
      {children}
    </Card>
  );
}
