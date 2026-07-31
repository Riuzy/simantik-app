import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../middlewares/auth';
import { ProjectService } from '../services/project.service';
import { AppError } from '../../../middlewares/error-handler';
import { ApiResponse } from '../../../utils/api-response';
import {
  projectParamSchema,
  slugParamSchema,
  createProjectBodySchema,
  updateProjectBodySchema,
  listProjectsQuerySchema,
} from '../validators/project.validators';
import { ProjectFilters } from '../types/project.dto';

export class ProjectController {
  constructor(private projectService: ProjectService) {}

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      const body = createProjectBodySchema.parse(req.body);
      const project = await this.projectService.create(body, req.user.id);
      ApiResponse.created(res, project);
    } catch (error) { next(error); }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = projectParamSchema.parse(req.params);
      const project = await this.projectService.getById(params.id);
      ApiResponse.success(res, project);
    } catch (error) { next(error); }
  };

  getBySlug = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = slugParamSchema.parse(req.params);
      const project = await this.projectService.getBySlug(params.slug);
      ApiResponse.success(res, project);
    } catch (error) { next(error); }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = projectParamSchema.parse(req.params);
      const body = updateProjectBodySchema.parse(req.body);
      const project = await this.projectService.update(params.id, body);
      ApiResponse.success(res, project);
    } catch (error) { next(error); }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = projectParamSchema.parse(req.params);
      await this.projectService.delete(params.id);
      ApiResponse.noContent(res);
    } catch (error) { next(error); }
  };

  list = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      const query = listProjectsQuerySchema.parse(req.query);
      const filters: Record<string, unknown> = {
        status: query.status,
        search: query.search,
        createdById: query.createdById,
        framework: query.framework,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      };
      const result = await this.projectService.list(query.page, query.limit, filters as ProjectFilters);
      ApiResponse.paginated(res, result.data, result.pagination.page, result.pagination.limit, result.pagination.total, result.pagination.totalPages);
    } catch (error) { next(error); }
  };
}
