'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../stores/auth-store';
import { useCurrentUser } from '../../features/auth/hooks/use-auth';
import { ROUTES } from '../../constants/routes';

const PUBLIC_ROUTES = ['/login', '/session-expired', '/unauthorized'];
const CHANGE_PASSWORD = '/change-password';

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const { isFetched } = useCurrentUser();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (hasRedirected.current) return;
    const isPublic = PUBLIC_ROUTES.some(r => pathname.startsWith(r));
    if (isPublic || pathname === CHANGE_PASSWORD) return;

    if (!token) {
      hasRedirected.current = true;
      router.push(ROUTES.LOGIN);
      return;
    }

    if (isFetched && user?.mustChangePassword && pathname !== CHANGE_PASSWORD) {
      hasRedirected.current = true;
      router.push(`${CHANGE_PASSWORD}?firstLogin=true`);
    }
  }, [token, isFetched, user, pathname, router]);

  if (!token && !PUBLIC_ROUTES.some(r => pathname.startsWith(r)) && pathname !== CHANGE_PASSWORD) return null;

  return <>{children}</>;
}
