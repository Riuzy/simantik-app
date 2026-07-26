import { z } from 'zod';
import { NotificationType } from '@prisma/client';
import {
  listNotificationsQuerySchema,
  markReadBodySchema,
} from '../validators/notification.validators';

export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;
export type MarkReadDTO = z.infer<typeof markReadBodySchema>;

export interface NotificationResponseDTO {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
}

export interface NotificationListDTO {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
}

export interface PaginationDTO {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NotificationListResponseDTO {
  data: NotificationListDTO[];
  pagination: PaginationDTO;
}

export interface UnreadCountDTO {
  count: number;
}
