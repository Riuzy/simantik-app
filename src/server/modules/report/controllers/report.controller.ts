import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../middlewares/auth';
import { ReportService } from '../services/report.service';
import { ApiResponse } from '../../../utils/api-response';
import { reportProjectParamSchema } from '../validators/report.validators';

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
}
