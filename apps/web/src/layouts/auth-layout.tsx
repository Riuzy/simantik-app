'use client';

import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function AuthLayout({ children }: Props) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </div>
  );
}
