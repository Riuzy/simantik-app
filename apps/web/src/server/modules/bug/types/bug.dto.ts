import { z } from 'zod';
import { Severity, BugPriority, BugStatus } from '@prisma/client';
import {
  createBugBodySchema,
  updateBugBodySchema,
  assignBugBodySchema,
  createCommentBodySchema,
  createAttachmentBodySchema,
  listBugsQuerySchema,
} from '../validators/bug.validators';

export type CreateBugDTO = z.infer<typeof createBugBodySchema>;
export type UpdateBugDTO = z.infer<typeof updateBugBodySchema>;
export type AssignBugDTO = z.infer<typeof assignBugBodySchema>;
export type CreateCommentDTO = z.infer<typeof createCommentBodySchema>;
export type CreateAttachmentDTO = z.infer<typeof createAttachmentBodySchema>;
export type ListBugsQuery = z.infer<typeof listBugsQuerySchema>;

export interface BugResponseDTO {
  id: string;
  code: string;
  title: string;
  description: string | null;
  severity: Severity;
  priority: BugPriority;
  status: BugStatus;
  executionId: string;
  projectId: string;
  reportedById: string;
  assignedToId: string | null;
  createdAt: Date;
  updatedAt: Date;
  execution: {
    id: string;
    testCase: {
      id: string;
      code: string;
      title: string;
    };
  };
  project: {
    id: string;
    code: string;
    name: string;
  };
  reportedBy: {
    id: string;
    name: string;
    email: string;
  };
  assignedTo: {
    id: string;
    name: string;
    email: string;
  } | null;
  _count: {
    comments: number;
    attachments: number;
    history: number;
  };
}

export interface BugListDTO {
  id: string;
  code: string;
  title: string;
  severity: Severity;
  priority: BugPriority;
  status: BugStatus;
  createdAt: Date;
  reportedBy: {
    id: string;
    name: string;
  };
  assignedTo: {
    id: string;
    name: string;
  } | null;
  project: {
    id: string;
    code: string;
    name: string;
  };
}

export interface BugFilters {
  projectId?: string;
  status?: BugStatus;
  severity?: Severity;
  priority?: BugPriority;
  reportedById?: string;
  assignedToId?: string;
  search?: string;
  sortBy?: 'createdAt' | 'title' | 'updatedAt' | 'priority' | 'severity';
  sortOrder?: 'asc' | 'desc';
}

// Comment DTOs
export interface CommentResponseDTO {
  id: string;
  bugReportId: string;
  userId: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

// Attachment DTOs
export interface AttachmentResponseDTO {
  id: string;
  bugReportId: string;
  uploadedById: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
  uploadedBy: {
    id: string;
    name: string;
  };
}

// History DTOs
export interface BugHistoryResponseDTO {
  id: string;
  bugReportId: string;
  changedById: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: Date;
  changedBy: {
    id: string;
    name: string;
  };
}

// Pagination
export interface PaginationDTO {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BugListResponseDTO {
  data: BugListDTO[];
  pagination: PaginationDTO;
}

export interface CommentListResponseDTO {
  data: CommentResponseDTO[];
  pagination: PaginationDTO;
}

export interface AttachmentListResponseDTO {
  data: AttachmentResponseDTO[];
  pagination: PaginationDTO;
}

export interface HistoryListResponseDTO {
  data: BugHistoryResponseDTO[];
  pagination: PaginationDTO;
}