'use client';

import { ReactNode } from 'react';
import { ProtectedRoute } from '../components/common/route-guards';
import { AppShell } from '../components/layout/app-shell';

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}
