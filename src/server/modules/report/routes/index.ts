import { Router } from 'express';
import { prisma } from '../../../lib/prisma';
import { ReportRepository } from '../repositories/report.repository';
import { ReportService } from '../services/report.service';
import { TestCaseReportService } from '../services/test-case-report.service';
import { ReportPdfService } from '../services/report-pdf.service';
import { ReportXlsxService } from '../services/report-xlsx.service';
import { ReportController } from '../controllers/report.controller';
import { requireAuth } from '../../../middlewares/auth';
import { validate } from '../../../middlewares/validate';
import { reportProjectParamSchema, reportDownloadQuerySchema } from '../validators/report.validators';

const reportRepository = new ReportRepository(prisma);
const testCaseReportService = new TestCaseReportService(prisma);
const reportService = new ReportService(reportRepository, testCaseReportService, new ReportPdfService(), new ReportXlsxService());
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

reportRouter.get(
  '/projects/:projectId/test-cases/pdf',
  requireAuth,
  validate({ params: reportProjectParamSchema, query: reportDownloadQuerySchema }),
  reportController.downloadTestCaseReportPdf
);

reportRouter.get(
  '/projects/:projectId/test-cases/excel',
  requireAuth,
  validate({ params: reportProjectParamSchema, query: reportDownloadQuerySchema }),
  reportController.downloadTestCaseReportXlsx
);
