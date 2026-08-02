import { Router } from 'express';
import { prisma } from '../../../lib/prisma';
import { ReportRepository } from '../repositories/report.repository';
import { ReportService } from '../services/report.service';
import { ReportController } from '../controllers/report.controller';
import { requireAuth } from '../../../middlewares/auth';
import { validate } from '../../../middlewares/validate';
import { reportProjectParamSchema } from '../validators/report.validators';

const reportRepository = new ReportRepository(prisma);
const reportService = new ReportService(reportRepository);
const reportController = new ReportController(reportService);

export const reportRouter = Router();

reportRouter.get(
  '/overview',
  requireAuth,
  reportController.getOverview
);

reportRouter.get(
  '/projects/:projectId',
  requireAuth,
  validate({ params: reportProjectParamSchema }),
  reportController.getProjectReport
);
