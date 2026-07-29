'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Center, Loader, Stack, Text } from '@mantine/core';
import { useAuthStore } from '../../stores/auth-store';
import { useCurrentUser } from '../../features/auth/hooks/use-auth';
import { useRole, usePermission } from '../../features/auth/hooks/use-permissions';
import { ROUTES } from '../../constants/routes';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const { isFetched } = useCurrentUser();

  useEffect(() => {
    if (!token) {
      router.push(ROUTES.LOGIN);
      return;
    }
    if (isFetched && user?.mustChangePassword) {
      router.push('/change-password?firstLogin=true');
    }
  }, [token, isFetched, user, router]);

  if (!token) return <Center h="100vh"><Loader /></Center>;

  if (user && user.mustChangePassword) return null;

  if (!isFetched) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed">Restoring session...</Text>
        </Stack>
      </Center>
    );
  }

  return <>{children}</>;
}

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const router = useRouter();

  useEffect(() => {
    if (token) {
      router.push(ROUTES.DASHBOARD);
    }
  }, [token, router]);

  if (token) return <Center h="100vh"><Loader /></Center>;

  return <>{children}</>;
}

export function RoleGuard({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: string[];
}) {
  const { hasRole } = useRole();

  if (!hasRole(...roles)) return null;

  return <>{children}</>;
}

export function PermissionGuard({
  children,
  permissions,
}: {
  children: React.ReactNode;
  permissions: string[];
}) {
  const { hasPermission } = usePermission();

  if (!hasPermission(...permissions)) return null;

  return <>{children}</>;
}
