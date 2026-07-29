import { apiClient } from '../../../services/api-client';
import { API } from '../../../constants/api';
import type { LoginRequest, LoginResponse, ChangePasswordRequest, User } from '../types';

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await apiClient.post(API.AUTH.LOGIN, data);
  return res.data.data as LoginResponse;
}

export async function logout(): Promise<void> {
  await apiClient.post(API.AUTH.LOGOUT);
}

export async function refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await apiClient.post(API.AUTH.REFRESH, { refreshToken: token });
  return res.data.data;
}

export async function getCurrentUser(): Promise<User> {
  const res = await apiClient.get(API.AUTH.ME);
  return res.data.data as User;
}

export async function changePassword(data: ChangePasswordRequest): Promise<void> {
  await apiClient.patch(API.AUTH.CHANGE_PASSWORD, data);
}
