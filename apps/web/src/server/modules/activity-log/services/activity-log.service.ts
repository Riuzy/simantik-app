import { ActivityLogRepository } from '../repositories/activity-log.repository';
import {
  ListActivityLogsQuery,
  ActivityLogListResponseDTO,
} from '../types/activity-log.dto';

export class ActivityLogService {
  constructor(private repository: ActivityLogRepository) {}

  async log(data: {
    userId: string;
    action: string;
    entity: string;
    entityId: string;
    description?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.repository.create(data);
  }

  async list(query: ListActivityLogsQuery, filters?: {
    entity?: string;
    entityId?: string;
    action?: string;
    userId?: string;
  }): Promise<ActivityLogListResponseDTO> {
    const result = await this.repository.list(query.page, query.limit, {
      entity: query.entity || filters?.entity,
      entityId: query.entityId || filters?.entityId,
      action: query.action || filters?.action,
      userId: query.userId || filters?.userId,
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

  async findByEntity(entity: string, entityId: string, page: number, limit: number) {
    const result = await this.repository.findByEntity(entity, entityId, page, limit);
    return {
      data: result.items,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }
}
