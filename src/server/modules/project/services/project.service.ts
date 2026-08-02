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

    return this.repository.create({
      code,
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      baseUrl: dto.baseUrl,
      framework: dto.framework,
      environment: dto.environment,
      status: 'ACTIVE',
      createdById,
    });
  }

  async getById(id: string) {
    const project = await this.repository.findById(id);
    if (!project) {
      throw new AppError(404, 'Project not found');
    }
    return project;
  }

  async getBySlug(slug: string) {
    return this.repository.findBySlugOrThrowWithDetails(slug);
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
    if (dto.baseUrl !== undefined) updateData.baseUrl = dto.baseUrl;
    if (dto.framework !== undefined) updateData.framework = dto.framework;
    if (dto.environment !== undefined) updateData.environment = dto.environment;
    if (dto.status !== undefined) updateData.status = dto.status;

    return this.repository.update(id, updateData);
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

  private async generateNextCode(): Promise<string> {
    const latest = await this.repository.findLatestCode();
    const nextNumber = latest ? parseInt(latest.code.replace('PROJ-', ''), 10) + 1 : 1;
    return `PROJ-${String(nextNumber).padStart(4, '0')}`;
  }
}
