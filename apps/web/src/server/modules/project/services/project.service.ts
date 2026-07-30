import { ProjectRepository } from '../repositories/project.repository';
import { AppError } from '../../../middlewares/error-handler';
import { CreateProjectDTO, UpdateProjectDTO, ProjectFilters } from '../types/project.dto';

export class ProjectService {
  constructor(private repository: ProjectRepository) {}

  async create(dto: CreateProjectDTO, createdById: string) {
    const existingBySlug = await this.repository.findBySlug(dto.slug);
    if (existingBySlug) {
      throw new AppError(409, 'Project with this slug already exists');
    }

    const code = await this.generateNextCode();

    const project = await this.repository.create({
      code,
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      status: 'ACTIVE',
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

    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.slug !== undefined) updateData.slug = dto.slug;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.status !== undefined) updateData.status = dto.status;

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

  async findAvailableMembers(projectId: string) {
    return this.repository.findAvailableMembers(projectId);
  }

  private async generateNextCode(): Promise<string> {
    const latest = await this.repository.findLatestCode();
    const nextNumber = latest ? parseInt(latest.code.replace('PROJ-', ''), 10) + 1 : 1;
    return `PROJ-${String(nextNumber).padStart(4, '0')}`;
  }
}