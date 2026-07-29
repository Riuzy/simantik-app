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
  validate({ query: listBugsQuerySchema }),
  bugController.listBugs
);

bugRouter.post(
  '/',
  requireAuth,
  requireRole('Manager', 'Tester'),
  validate({ body: createBugBodySchema }),
  bugController.createBug
);

bugRouter.get(
  '/:id',
  requireAuth,
  validate({ params: bugIdParamSchema }),
  bugController.getBugById
);

bugRouter.patch(
  '/:id',
  requireAuth,
  requireRole('Manager', 'Tester'),
  validate({ params: bugIdParamSchema, body: updateBugBodySchema }),
  bugController.updateBug
);

bugRouter.delete(
  '/:id',
  requireAuth,
  requireRole('Manager', 'Tester'),
  validate({ params: bugIdParamSchema }),
  bugController.deleteBug
);

bugRouter.patch(
  '/:id/assign',
  requireAuth,
  requireRole('Manager', 'Tester'),
  validate({ params: bugIdParamSchema, body: assignBugBodySchema }),
  bugController.assignBug
);

bugRouter.patch(
  '/:id/in-progress',
  requireAuth,
  requireRole('Manager', 'Tester', 'Developer'),
  validate({ params: bugIdParamSchema }),
  bugController.inProgressBug
);

bugRouter.patch(
  '/:id/resolve',
  requireAuth,
  requireRole('Manager', 'Developer'),
  validate({ params: bugIdParamSchema }),
  bugController.resolveBug
);

bugRouter.patch(
  '/:id/close',
  requireAuth,
  requireRole('Manager', 'Tester'),
  validate({ params: bugIdParamSchema }),
  bugController.closeBug
);

bugRouter.patch(
  '/:id/reopen',
  requireAuth,
  requireRole('Manager', 'Tester'),
  validate({ params: bugIdParamSchema }),
  bugController.reopenBug
);

bugRouter.post(
  '/:bugId/comments',
  requireAuth,
  validate({ params: bugIdParamSchema, body: createCommentBodySchema }),
  bugController.addComment
);

bugRouter.get(
  '/:bugId/comments',
  requireAuth,
  validate({ params: bugIdParamSchema, query: listCommentsQuerySchema }),
  bugController.listComments
);

bugRouter.delete(
  '/:bugId/comments/:commentId',
  requireAuth,
  validate({ params: bugCommentParamSchema }),
  bugController.deleteComment
);

bugRouter.post(
  '/:bugId/attachments',
  requireAuth,
  validate({ params: bugIdParamSchema, body: createAttachmentBodySchema }),
  bugController.addAttachment
);

bugRouter.get(
  '/:bugId/attachments',
  requireAuth,
  validate({ params: bugIdParamSchema, query: listAttachmentsQuerySchema }),
  bugController.listAttachments
);

bugRouter.delete(
  '/:bugId/attachments/:attachmentId',
  requireAuth,
  validate({ params: bugAttachmentParamSchema }),
  bugController.deleteAttachment
);

bugRouter.get(
  '/:bugId/history',
  requireAuth,
  validate({ params: bugIdParamSchema, query: listHistoryQuerySchema }),
  bugController.listHistory
);

bugRouter.get(
  '/statistics',
  requireAuth,
  bugController.getBugStatistics
);