import { apiClient } from '../../../services/api-client';
import { API } from '../../../constants/api';
import type { LoginRequest, LoginResponse, ChangePasswordRequest, UpdateProfileRequest, User } from '../types';

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

export async function updateProfile(data: UpdateProfileRequest): Promise<User> {
  const res = await apiClient.patch(API.AUTH.UPDATE_PROFILE, data);
  return res.data.data as User;
}

export async function uploadAvatar(file: File): Promise<User> {
  const buffer = await file.arrayBuffer();
  const res = await apiClient.post(API.AUTH.UPLOAD_AVATAR, buffer, {
    headers: { 'Content-Type': file.type },
    timeout: 30000,
  });
  return res.data.data as User;
}
