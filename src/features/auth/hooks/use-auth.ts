'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { useAuthStore } from '../../../stores/auth-store';
import * as authService from '../services';
import type { LoginRequest, ChangePasswordRequest, UpdateProfileRequest } from '../types';
import { ROUTES } from '../../../constants/routes';

export function useLogin() {
  const router = useRouter();
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (res) => {
      setToken(res.accessToken);
      if (res.refreshToken) {
        localStorage.setItem('refresh_token', res.refreshToken);
      }
      if (res.mustChangePassword && !res.user) {
        router.push('/change-password?firstLogin=true');
        return;
      }
      if (res.user) {
        setUser(res.user);
      }
      router.push(ROUTES.DASHBOARD);
    },
    onError: () => {
      notifications.show({
        title: 'Login failed',
        message: 'Invalid email or password',
        color: 'red',
      });
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clearSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clearSession();
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      queryClient.clear();
      router.push(ROUTES.LOGIN);
    },
  });
}

export function useCurrentUser() {
  const setUser = useAuthStore((s) => s.setUser);
  const clearSession = useAuthStore((s) => s.clearSession);
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      try {
        const user = await authService.getCurrentUser();
        setUser(user);
        return user;
      } catch (err) {
        clearSession();
        throw err;
      }
    },
    enabled: !!token,
    retry: 1,
    staleTime: 60000,
  });
}

export function useChangePassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => authService.changePassword(data),
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Password changed successfully',
        color: 'green',
      });
      router.push(ROUTES.DASHBOARD);
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to change password. Check your current password.',
        color: 'red',
      });
    },
  });
}

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => authService.updateProfile(data),
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(['current-user'], user);
      notifications.show({
        title: 'Success',
        message: 'Profile updated successfully',
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to update profile',
        color: 'red',
      });
    },
  });
}
