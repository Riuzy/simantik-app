import { Router } from 'express';
import { prisma } from '../../../lib/prisma';
import { BugRepository } from '../repositories/bug.repository';
import { BugService } from '../services/bug.service';
import { BugController } from '../controllers/bug.controller';
import { requireAuth, requireRole } from '../../../middlewares/auth';
import { validate } from '../../../middlewares/validate';
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

const bugRepository = new BugRepository(prisma);
const bugService = new BugService(bugRepository);
const bugController = new BugController(bugService);

export const bugRouter = Router();

bugRouter.get(
  '/',
  requireAuth,
  validate(listBugsQuerySchema),
  bugController.listBugs
);

bugRouter.post(
  '/',
  requireAuth,
  requireRole('Manager', 'Tester'),
  validate(createBugBodySchema),
  bugController.createBug
);

bugRouter.get(
  '/:id',
  requireAuth,
  validate(bugIdParamSchema),
  bugController.getBugById
);

bugRouter.patch(
  '/:id',
  requireAuth,
  requireRole('Manager', 'Tester'),
  validate(bugIdParamSchema),
  validate(updateBugBodySchema),
  bugController.updateBug
);

bugRouter.delete(
  '/:id',
  requireAuth,
  requireRole('Manager', 'Tester'),
  validate(bugIdParamSchema),
  bugController.deleteBug
);

bugRouter.patch(
  '/:id/assign',
  requireAuth,
  requireRole('Manager', 'Tester'),
  validate(bugIdParamSchema),
  validate(assignBugBodySchema),
  bugController.assignBug
);

bugRouter.patch(
  '/:id/in-progress',
  requireAuth,
  requireRole('Manager', 'Tester', 'Developer'),
  validate(bugIdParamSchema),
  bugController.inProgressBug
);

bugRouter.patch(
  '/:id/resolve',
  requireAuth,
  requireRole('Manager', 'Developer'),
  validate(bugIdParamSchema),
  bugController.resolveBug
);

bugRouter.patch(
  '/:id/close',
  requireAuth,
  requireRole('Manager', 'Tester'),
  validate(bugIdParamSchema),
  bugController.closeBug
);

bugRouter.patch(
  '/:id/reopen',
  requireAuth,
  requireRole('Manager', 'Tester'),
  validate(bugIdParamSchema),
  bugController.reopenBug
);

bugRouter.post(
  '/:bugId/comments',
  requireAuth,
  validate(bugIdParamSchema),
  validate(createCommentBodySchema),
  bugController.addComment
);

bugRouter.get(
  '/:bugId/comments',
  requireAuth,
  validate(bugIdParamSchema),
  validate(listCommentsQuerySchema),
  bugController.listComments
);

bugRouter.delete(
  '/:bugId/comments/:commentId',
  requireAuth,
  validate(bugCommentParamSchema),
  bugController.deleteComment
);

bugRouter.post(
  '/:bugId/attachments',
  requireAuth,
  validate(bugIdParamSchema),
  validate(createAttachmentBodySchema),
  bugController.addAttachment
);

bugRouter.get(
  '/:bugId/attachments',
  requireAuth,
  validate(bugIdParamSchema),
  validate(listAttachmentsQuerySchema),
  bugController.listAttachments
);

bugRouter.delete(
  '/:bugId/attachments/:attachmentId',
  requireAuth,
  validate(bugAttachmentParamSchema),
  bugController.deleteAttachment
);

bugRouter.get(
  '/:bugId/history',
  requireAuth,
  validate(bugIdParamSchema),
  validate(listHistoryQuerySchema),
  bugController.listHistory
);

bugRouter.get(
  '/statistics',
  requireAuth,
  bugController.getBugStatistics
);
