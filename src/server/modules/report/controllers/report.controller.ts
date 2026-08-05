import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../middlewares/auth';
import { ReportService } from '../services/report.service';
import { ApiResponse } from '../../../utils/api-response';
import { reportProjectParamSchema, reportDownloadQuerySchema } from '../validators/report.validators';
import type { TestCaseReportOptions } from '../services/test-case-report.types';

function dateStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseOptions(query: Record<string, unknown>): TestCaseReportOptions {
  const parsed = reportDownloadQuerySchema.parse(query);
  return {
    includeSummary: parsed.summary === 'true',
    includeTestCase: parsed.testCase === 'true',
    includeExpectedResult: parsed.expectedResult === 'true',
    includeActualResult: parsed.actualResult === 'true',
    includeStatus: parsed.status === 'true',
  };
}

export class ReportController {
  constructor(private reportService: ReportService) {}

  getOverview = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const report = await this.reportService.getOverview();
      ApiResponse.success(res, report);
    } catch (error) { next(error); }
  };

  getProjectReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = reportProjectParamSchema.parse(req.params);
      const report = await this.reportService.getProjectReport(params.projectId);
      ApiResponse.success(res, report);
    } catch (error) { next(error); }
  };

  downloadTestCaseReportPdf = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = reportProjectParamSchema.parse(req.params);
      const options = parseOptions(req.query as Record<string, unknown>);
      const buffer = await this.reportService.getTestCaseReportPdf(params.projectId, options);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="simantik-test-report-${dateStamp()}.pdf"`);
      res.setHeader('Content-Length', buffer.length);
      res.end(buffer);
    } catch (error) { next(error); }
  };

  downloadTestCaseReportXlsx = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = reportProjectParamSchema.parse(req.params);
      const options = parseOptions(req.query as Record<string, unknown>);
      const buffer = await this.reportService.getTestCaseReportXlsx(params.projectId, options);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="simantik-test-report-${dateStamp()}.xlsx"`);
      res.setHeader('Content-Length', buffer.length);
      res.end(buffer);
    } catch (error) { next(error); }
  };
}
