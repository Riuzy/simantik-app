import { AppError } from '../../../middlewares/error-handler';
import { ReportRepository } from '../repositories/report.repository';

export class ReportService {
  constructor(private repository: ReportRepository) {}

  async getOverview() {
    return this.repository.getOverview();
  }

  async getProjectReport(projectId: string) {
    const report = await this.repository.getProjectReport(projectId);
    if (!report.project) throw new AppError(404, 'Project not found');
    return report;
  }
}
