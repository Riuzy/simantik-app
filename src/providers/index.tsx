'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { useAuthStore } from '../stores/auth-store';
import { AppearanceBoundary } from './appearance-boundary';

export function Providers({ children }: { children: ReactNode }) {
  const setToken = useAuthStore((s) => s.setToken);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) setToken(token);
    setHydrated();
  }, [setToken, setHydrated]);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30000, gcTime: 300000 },
          mutations: { retry: 0 },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AppearanceBoundary>
        <Notifications position="top-right" limit={5} />
        <ModalsProvider>{children}</ModalsProvider>
      </AppearanceBoundary>
    </QueryClientProvider>
  );
}
