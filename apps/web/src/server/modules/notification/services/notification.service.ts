import { NotificationType } from '@prisma/client';
import { NotificationRepository } from '../repositories/notification.repository';
import { AppError } from '../../../middlewares/error-handler';
import {
  ListNotificationsQuery,
  MarkReadDTO,
  NotificationListResponseDTO,
  UnreadCountDTO,
} from '../types/notification.dto';

export class NotificationService {
  constructor(private repository: NotificationRepository) {}

  async list(
    userId: string,
    query: ListNotificationsQuery,
  ): Promise<NotificationListResponseDTO> {
    const result = await this.repository.list(userId, query.page, query.limit, {
      type: query.type,
      isRead: query.isRead,
    });
    return {
      data: result.items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }

  async getById(id: string, userId: string) {
    const notification = await this.repository.findById(id, userId);
    if (!notification) {
      throw new AppError(404, 'Notification not found');
    }
    return notification;
  }

  async markAsRead(dto: MarkReadDTO, userId: string) {
    const count = await this.repository.markAsRead(dto.ids, userId);
    return { count: count.count };
  }

  async markAllAsRead(userId: string) {
    const count = await this.repository.markAllAsRead(userId);
    return { count: count.count };
  }

  async getUnreadCount(userId: string): Promise<UnreadCountDTO> {
    const count = await this.repository.getUnreadCount(userId);
    return { count };
  }

  async delete(id: string, userId: string) {
    const result = await this.repository.delete(id, userId);
    if (!result) {
      throw new AppError(404, 'Notification not found');
    }
  }

  async create(userId: string, title: string, message: string, type: NotificationType = 'INFO') {
    return this.repository.create({ userId, title, message, type });
  }
}
