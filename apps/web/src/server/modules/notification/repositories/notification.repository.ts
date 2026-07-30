import { PrismaClient, NotificationType, Prisma } from '@prisma/client';

type MetadataInput = Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue;

export class NotificationRepository {
  constructor(private prisma: PrismaClient) {}

  private readonly baseSelect = {
    id: true,
    userId: true,
    title: true,
    message: true,
    type: true,
    isRead: true,
    readAt: true,
    metadata: true,
    createdAt: true,
  };

  private readonly listSelect = {
    id: true,
    title: true,
    message: true,
    type: true,
    isRead: true,
    metadata: true,
    createdAt: true,
  };

  async create(data: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    metadata?: MetadataInput;
  }) {
    return this.prisma.notification.create({
      data,
      select: this.baseSelect,
    });
  }

  async findById(id: string, userId: string) {
    return this.prisma.notification.findFirst({
      where: { id, userId },
      select: this.baseSelect,
    });
  }

  async list(userId: string, page: number, limit: number, filters: {
    type?: NotificationType;
    isRead?: boolean;
  }) {
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };
    if (filters.type) where.type = filters.type;
    if (filters.isRead !== undefined) where.isRead = filters.isRead;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        where: where as any,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: this.listSelect,
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.prisma.notification.count({ where: where as any }),
    ]);

    return { items, total, totalPages: Math.ceil(total / limit) };
  }

  async markAsRead(ids: string[], userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        id: { in: ids },
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async delete(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) return null;

    return this.prisma.notification.delete({
      where: { id },
    });
  }

  async createMany(data: Array<{
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    metadata?: MetadataInput;
  }>) {
    return this.prisma.notification.createMany({ data });
  }
}
