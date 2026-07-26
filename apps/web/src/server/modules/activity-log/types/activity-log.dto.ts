import { z } from 'zod';
import { listActivityLogsQuerySchema } from '../validators/activity-log.validators';

export type ListActivityLogsQuery = z.infer<typeof listActivityLogsQuerySchema>;

export interface ActivityLogResponseDTO {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  description: string | null;
  ipAddress: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
  };
}

export interface PaginationDTO {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ActivityLogListResponseDTO {
  data: ActivityLogResponseDTO[];
  pagination: PaginationDTO;
}
