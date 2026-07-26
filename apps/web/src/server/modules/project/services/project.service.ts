import { ProjectStatus } from '@prisma/client';
import { ProjectRepository } from '../repositories/project.repository';
import { AppError } from '../../../middlewares/error-handler';
import { CreateProjectDTO, UpdateProjectDTO, ProjectFilters } from '../types/project.dto';

export class ProjectService {
  constructor(private repository: ProjectRepository) {}

  async create(dto: CreateProjectDTO, createdById: string) {
    const existingByCode = await this.repository.findByCode(dto.code);
    if (existingByCode) {
      throw new AppError(409, 'Project with this code already exists');
    }

    const existingBySlug = await this.repository.findBySlug(dto.slug);
    if (existingBySlug) {
      throw new AppError(409, 'Project with this slug already exists');
    }

    const project = await this.repository.create({
      code: dto.code,
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      status: dto.status || 'ACTIVE',
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      createdById,
    });

    return project;
  }

  async getById(id: string) {
    const project = await this.repository.findById(id);
    if (!project) {
      throw new AppError(404, 'Project not found');
    }
    return project;
  }

  async update(id: string, dto: UpdateProjectDTO) {
    if (dto.slug) {
      const existingBySlug = await this.repository.findBySlug(dto.slug);
      if (existingBySlug && existingBySlug.id !== id) {
        throw new AppError(409, 'Project with this slug already exists');
      }
    }

    const updateData: Partial<{
      name: string;
      slug: string;
      description: string;
      status: ProjectStatus;
      startDate: Date;
      endDate: Date;
    }> = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.slug !== undefined) updateData.slug = dto.slug;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.startDate !== undefined) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) updateData.endDate = new Date(dto.endDate);

    const project = await this.repository.update(id, updateData);
    return project;
  }

  async delete(id: string) {
    const project = await this.repository.findById(id);
    if (!project) {
      throw new AppError(404, 'Project not found');
    }
    await this.repository.softDelete(id);
  }

  async list(page: number, limit: number, filters: ProjectFilters) {
    const result = await this.repository.list(page, limit, filters);
    return {
      data: result.items,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }

  async addMember(projectId: string, userId: string) {
    const member = await this.repository.addMember(projectId, userId);
    return member;
  }

  async removeMember(projectId: string, userId: string) {
    await this.repository.removeMember(projectId, userId);
  }

  async listMembers(projectId: string) {
    const members = await this.repository.listMembers(projectId);
    return members;
  }

  async isMember(projectId: string, userId: string): Promise<boolean> {
    return this.repository.isMember(projectId, userId);
  }
}