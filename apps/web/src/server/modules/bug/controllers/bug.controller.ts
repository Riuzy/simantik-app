import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../middlewares/auth';
import { BugService } from '../services/bug.service';
import { AppError } from '../../../middlewares/error-handler';
import { ApiResponse } from '../../../utils/api-response';
import {
  bugIdParamSchema,
  bugCommentParamSchema,
  bugAttachmentParamSchema,
  listBugsQuerySchema,
  listCommentsQuerySchema,
  listAttachmentsQuerySchema,
  listHistoryQuerySchema,
  createBugBodySchema,
  updateBugBodySchema,
  assignBugBodySchema,
  createCommentBodySchema,
  createAttachmentBodySchema,
} from '../validators/bug.validators';
import { BugStatus } from '@prisma/client';

export class BugController {
  constructor(private bugService: BugService) {}

  createBug = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required');
      }
      const body = createBugBodySchema.parse(req.body);
      const bug = await this.bugService.createBug(body, req.user.id);
      ApiResponse.created(res, bug);
    } catch (error) {
      next(error);
    }
  };

  getBugById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = bugIdParamSchema.parse(req.params);
      const bug = await this.bugService.getBugById(params.id);
      ApiResponse.success(res, bug);
    } catch (error) {
      next(error);
    }
  };

  updateBug = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required');
      }
      const params = bugIdParamSchema.parse(req.params);
      const body = updateBugBodySchema.parse(req.body);
      const bug = await this.bugService.updateBug(params.id, body, req.user.id);
      ApiResponse.success(res, bug);
    } catch (error) {
      next(error);
    }
  };

  deleteBug = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = bugIdParamSchema.parse(req.params);
      await this.bugService.deleteBug(params.id);
      ApiResponse.noContent(res);
    } catch (error) {
      next(error);
    }
  };

  listBugs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = listBugsQuerySchema.parse(req.query);
      const result = await this.bugService.listBugs(query.page, query.limit, {
        projectId: query.projectId,
        status: query.status as BugStatus | undefined,
        severity: query.severity,
        priority: query.priority,
        reportedById: query.reportedById,
        assignedToId: query.assignedToId,
        search: query.search,
        sortBy: query.sortBy as 'createdAt' | 'title' | 'updatedAt' | 'priority' | 'severity' | undefined,
        sortOrder: query.sortOrder,
      });
      ApiResponse.paginated(res, result.data, result.pagination.page, result.pagination.limit, result.pagination.total, result.pagination.totalPages);
    } catch (error) {
      next(error);
    }
  };

  assignBug = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      const params = bugIdParamSchema.parse(req.params);
      const body = assignBugBodySchema.parse(req.body);
      const result = await this.bugService.assignBug(params.id, body, req.user.id);
      ApiResponse.success(res, result);
    } catch (error) { next(error); }
  };

  resolveBug = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      const params = bugIdParamSchema.parse(req.params);
      const result = await this.bugService.resolveBug(params.id, req.user.id);
      ApiResponse.success(res, result);
    } catch (error) { next(error); }
  };

  closeBug = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      const params = bugIdParamSchema.parse(req.params);
      const result = await this.bugService.closeBug(params.id, req.user.id);
      ApiResponse.success(res, result);
    } catch (error) { next(error); }
  };

  reopenBug = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      const params = bugIdParamSchema.parse(req.params);
      const result = await this.bugService.reopenBug(params.id, req.user.id);
      ApiResponse.success(res, result);
    } catch (error) { next(error); }
  };

  inProgressBug = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      const params = bugIdParamSchema.parse(req.params);
      const result = await this.bugService.inProgressBug(params.id, req.user.id);
      ApiResponse.success(res, result);
    } catch (error) { next(error); }
  };

  addComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      const params = bugIdParamSchema.parse(req.params);
      const body = createCommentBodySchema.parse(req.body);
      const comment = await this.bugService.addComment(params.id, body, req.user.id);
      ApiResponse.created(res, comment);
    } catch (error) { next(error); }
  };

  listComments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = bugIdParamSchema.parse(req.params);
      const query = listCommentsQuerySchema.parse(req.query);
      const result = await this.bugService.listComments(params.id, query.page, query.limit);
      ApiResponse.paginated(res, result.items, query.page, query.limit, result.total, result.totalPages);
    } catch (error) { next(error); }
  };

  deleteComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = bugCommentParamSchema.parse(req.params);
      await this.bugService.deleteComment(params.bugId, params.commentId);
      ApiResponse.noContent(res);
    } catch (error) { next(error); }
  };

  addAttachment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      const params = bugIdParamSchema.parse(req.params);
      const body = createAttachmentBodySchema.parse(req.body);
      const attachment = await this.bugService.addAttachment(params.id, body, req.user.id);
      ApiResponse.created(res, attachment);
    } catch (error) { next(error); }
  };

  listAttachments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = bugIdParamSchema.parse(req.params);
      const query = listAttachmentsQuerySchema.parse(req.query);
      const result = await this.bugService.listAttachments(params.id, query.page, query.limit);
      ApiResponse.paginated(res, result.items, query.page, query.limit, result.total, result.totalPages);
    } catch (error) { next(error); }
  };

  deleteAttachment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = bugAttachmentParamSchema.parse(req.params);
      await this.bugService.deleteAttachment(params.bugId, params.attachmentId);
      ApiResponse.noContent(res);
    } catch (error) { next(error); }
  };

  listHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = bugIdParamSchema.parse(req.params);
      const query = listHistoryQuerySchema.parse(req.query);
      const result = await this.bugService.listHistory(params.id, query.page, query.limit);
      ApiResponse.paginated(res, result.items, query.page, query.limit, result.total, result.totalPages);
    } catch (error) { next(error); }
  };

  getBugStatistics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projectId = req.query.projectId as string | undefined;
      const stats = await this.bugService.getBugStatistics(projectId);
      ApiResponse.success(res, stats);
    } catch (error) { next(error); }
  };
}