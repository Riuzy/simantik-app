export class ActivityLogRepository {
  constructor(private prisma: import('@prisma/client').PrismaClient) {}

  async create(data: {
    userId: string;
    action: string;
    entity: string;
    entityId: string;
    description?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.activityLog.create({ data });
  }

  async list(page: number, limit: number, filters: {
    entity?: string;
    entityId?: string;
    action?: string;
    userId?: string;
  }) {
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (filters.entity) where.entity = filters.entity;
    if (filters.entityId) where.entityId = filters.entityId;
    if (filters.action) where.action = filters.action;
    if (filters.userId) where.userId = filters.userId;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.activityLog.findMany({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        where: where as any,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.prisma.activityLog.count({ where: where as any }),
    ]);

    return { items, total, totalPages: Math.ceil(total / limit) };
  }

  async findByEntity(entity: string, entityId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.activityLog.findMany({
        where: { entity, entityId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
      }),
      this.prisma.activityLog.count({ where: { entity, entityId } }),
    ]);

    return { items, total, totalPages: Math.ceil(total / limit) };
  }
}
