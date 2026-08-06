'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Center, Loader, Stack, Text } from '@mantine/core';
import { useAuthStore } from '../../stores/auth-store';
import { useCurrentUser } from '../../features/auth/hooks/use-auth';
import { ROUTES } from '../../constants/routes';

const CHANGE_PASSWORD = '/change-password';

function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <Center h="100vh">
      <Stack align="center" gap="md">
        <Loader size="lg" />
        <Text c="dimmed">{message}</Text>
      </Stack>
    </Center>
  );
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, user, hydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const { isFetched } = useCurrentUser();

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      router.push(ROUTES.LOGIN);
      return;
    }
    if (isFetched && user?.mustChangePassword && pathname !== CHANGE_PASSWORD) {
      router.push(`${CHANGE_PASSWORD}?firstLogin=true`);
    }
  }, [hydrated, token, isFetched, user, router, pathname]);

  if (!hydrated) return <LoadingScreen message="Loading session..." />;

  if (!token) return null;

  if (user?.mustChangePassword && pathname !== CHANGE_PASSWORD) return null;

  if (!isFetched && token) return <LoadingScreen message="Restoring session..." />;

  return <>{children}</>;
}

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { token, hydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (token) router.push(ROUTES.DASHBOARD);
  }, [hydrated, token, router]);

  if (!hydrated) return <LoadingScreen />;

  if (token) return null;

  return <>{children}</>;
}
