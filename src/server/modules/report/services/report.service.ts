import { AppError } from '../../../middlewares/error-handler';
import { ReportRepository } from '../repositories/report.repository';
import { TestCaseReportService } from './test-case-report.service';
import { ReportPdfService, DEFAULT_REPORT_OPTIONS } from './report-pdf.service';
import { ReportXlsxService } from './report-xlsx.service';
import type { TestCaseReportOptions } from './test-case-report.types';

export class ReportService {
  constructor(
    private repository: ReportRepository,
    private testCaseReportService: TestCaseReportService,
    private pdfService: ReportPdfService,
    private xlsxService: ReportXlsxService,
  ) {}

  async getOverview() {
    return this.repository.getOverview();
  }

  async getProjectReport(projectId: string) {
    const report = await this.repository.getProjectReport(projectId);
    if (!report.project) throw new AppError(404, 'Project not found');
    return report;
  }

  async getTestCaseReportPdf(projectId: string, options: TestCaseReportOptions = DEFAULT_REPORT_OPTIONS): Promise<Buffer> {
    const data = await this.testCaseReportService.build(projectId);
    return this.pdfService.generate(data, options);
  }

  async getTestCaseReportXlsx(projectId: string, options: TestCaseReportOptions = DEFAULT_REPORT_OPTIONS): Promise<Buffer> {
    const data = await this.testCaseReportService.build(projectId);
    return this.xlsxService.generate(data, options);
  }
}
