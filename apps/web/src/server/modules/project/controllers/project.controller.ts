import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../middlewares/auth';
import { ProjectService } from '../services/project.service';
import { UserService } from '../../user/services/user.service';
import { AppError } from '../../../middlewares/error-handler';
import { ApiResponse } from '../../../utils/api-response';
import {
  projectParamSchema,
  createProjectBodySchema,
  updateProjectBodySchema,
  listProjectsQuerySchema,
  addMemberParamSchema,
  removeMemberParamSchema,
} from '../validators/project.validators';

export class ProjectController {
  constructor(private projectService: ProjectService, private userService: UserService) {}

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
      const query = listProjectsQuerySchema.parse(req.query);
      const result = await this.projectService.list(query.page, query.limit, {
        status: query.status,
        search: query.search,
        createdById: query.createdById,
        sortBy: query.sortBy as 'createdAt' | 'name' | 'updatedAt' | undefined,
        sortOrder: query.sortOrder,
      });
      ApiResponse.paginated(res, result.data, result.pagination.page, result.pagination.limit, result.pagination.total, result.pagination.totalPages);
    } catch (error) { next(error); }
  };

  addMember = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      const params = projectParamSchema.parse(req.params);
      const body = addMemberParamSchema.parse(req.body);
      const projectId = params.id;
      const userId = body.userId;
      const project = await this.projectService.getById(projectId);
      if (req.user.id !== project.createdById) {
        const userRole = await this.userService.getById(req.user.id);
        if (userRole.role.name !== 'Manager') throw new AppError(403, 'Only project creator or Manager can add members');
      }
      const member = await this.projectService.addMember(projectId, userId);
      ApiResponse.created(res, member);
    } catch (error) { next(error); }
  };

  removeMember = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      const params = projectParamSchema.parse(req.params);
      const memberParams = removeMemberParamSchema.parse(req.params);
      const projectId = params.id;
      const userId = memberParams.userId;
      const project = await this.projectService.getById(projectId);
      if (req.user.id !== project.createdById) {
        const userRole = await this.userService.getById(req.user.id);
        if (userRole.role.name !== 'Manager') throw new AppError(403, 'Only project creator or Manager can remove members');
      }
      if (userId === project.createdById) throw new AppError(400, 'Cannot remove project creator');
      await this.projectService.removeMember(projectId, userId);
      ApiResponse.noContent(res);
    } catch (error) { next(error); }
  };

  listMembers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      const params = projectParamSchema.parse(req.params);
      const projectId = params.id;
      const project = await this.projectService.getById(projectId);
      const isMember = await this.projectService.isMember(projectId, req.user.id);
      if (req.user.id !== project.createdById && !isMember) {
        const userRole = await this.userService.getById(req.user.id);
        if (userRole.role.name !== 'Manager') throw new AppError(403, 'Access denied');
      }
      const members = await this.projectService.listMembers(projectId);
      ApiResponse.success(res, members);
    } catch (error) { next(error); }
  };
}