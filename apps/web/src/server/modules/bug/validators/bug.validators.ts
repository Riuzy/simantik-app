import { z } from 'zod';
import { Severity, BugPriority, BugStatus } from '@prisma/client';
import { commonQuerySchema, idParamSchema } from '../../../validators/common.validators';

// Params
export const bugIdParamSchema = idParamSchema;

export const bugCommentParamSchema = z.object({
  bugId: z.string().uuid('Invalid bug ID'),
  commentId: z.string().uuid('Invalid comment ID'),
});

export const bugAttachmentParamSchema = z.object({
  bugId: z.string().uuid('Invalid bug ID'),
  attachmentId: z.string().uuid('Invalid attachment ID'),
});

// Query
export const listBugsQuerySchema = commonQuerySchema.extend({
  projectId: z.string().uuid('Invalid project ID').optional(),
  status: z.nativeEnum(BugStatus).optional(),
  severity: z.nativeEnum(Severity).optional(),
  priority: z.nativeEnum(BugPriority).optional(),
  reportedById: z.string().uuid('Invalid user ID').optional(),
  assignedToId: z.string().uuid('Invalid user ID').optional(),
  sortBy: z.enum(['createdAt', 'title', 'updatedAt', 'priority', 'severity']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const listCommentsQuerySchema = commonQuerySchema;
export const listAttachmentsQuerySchema = commonQuerySchema;
export const listHistoryQuerySchema = commonQuerySchema;

// Body
export const createBugBodySchema = z.object({
  code: z.string()
    .min(2, 'Code must be at least 2 characters')
    .max(50, 'Code cannot exceed 50 characters')
    .regex(/^[A-Z0-9-]+$/, 'Code can only contain uppercase letters, numbers, and hyphens'),
  title: z.string().min(2, 'Title must be at least 2 characters').max(255, 'Title cannot exceed 255 characters'),
  description: z.string().max(1000).optional().transform(val => val || null),
  severity: z.nativeEnum(Severity),
  priority: z.nativeEnum(BugPriority),
  executionId: z.string().uuid('Invalid execution ID'),
  projectId: z.string().uuid('Invalid project ID'),
  assignedToId: z.string().uuid('Invalid user ID').optional(),
});

export const updateBugBodySchema = z.object({
  title: z.string().min(2).max(255).optional(),
  description: z.string().max(1000).optional().transform(val => val || null),
  severity: z.nativeEnum(Severity).optional(),
  priority: z.nativeEnum(BugPriority).optional(),
  status: z.nativeEnum(BugStatus).optional(),
  assignedToId: z.string().uuid('Invalid user ID').optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'At least one field required for update' });

export const assignBugBodySchema = z.object({
  assignedToId: z.string().uuid('Invalid user ID'),
});

export const createCommentBodySchema = z.object({
  message: z.string().min(1, 'Message is required').max(1000, 'Message cannot exceed 1000 characters'),
});

export const createAttachmentBodySchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  filePath: z.string().min(1, 'File path is required'),
  fileType: z.string().min(1, 'File type is required'),
  fileSize: z.number().int().min(0, 'File size must be positive'),
});