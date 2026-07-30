import { apiClient } from '../../../services/api-client';
import { API } from '../../../constants/api';
import type { NotificationListResponse, UnreadCount } from '../types';

export async function listNotifications(params?: Record<string, unknown>): Promise<NotificationListResponse> {
  const res = await apiClient.get(API.NOTIFICATIONS.BASE, { params });
  return { data: res.data.data, pagination: res.data.meta };
}

export async function getUnreadCount(): Promise<UnreadCount> {
  const res = await apiClient.get(API.NOTIFICATIONS.UNREAD_COUNT);
  return res.data.data;
}

export async function markAsRead(ids: string[]): Promise<void> {
  await apiClient.patch(API.NOTIFICATIONS.MARK_READ, { ids });
}

export async function markAllAsRead(): Promise<void> {
  await apiClient.patch(API.NOTIFICATIONS.MARK_ALL_READ);
}
