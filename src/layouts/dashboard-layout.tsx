'use client';

import { ReactNode } from 'react';
import { ProtectedRoute } from '../components/common/route-guards';
import { Shell } from '../components/layout/app-shell';

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <Shell>{children}</Shell>
    </ProtectedRoute>
  );
}
