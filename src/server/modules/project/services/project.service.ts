import { ProjectRepository } from '../repositories/project.repository';
import { AppError } from '../../../middlewares/error-handler';
import { CreateProjectDTO, UpdateProjectDTO, ProjectFilters, ProjectResponseDTO, ProjectListDTO } from '../types/project.dto';
import { encryptSecret } from '../../../utils/encryption';

interface ProjectEntity {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  framework: string;
  baseUrl: string | null;
  browser: string;
  environment: string | null;
  headless: boolean;
  timeout: number;
  slowMo: number;
  viewportWidth: number;
  viewportHeight: number;
  debugMode: boolean;
  authenticationEnabled: boolean;
  loginUrl: string | null;
  loginEmail: string | null;
  loginPassword: string | null;
  loginMethod: string;
  sessionStrategy: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: { id: string; name: string; email: string; avatar?: string | null };
  _count?: { testCases: number; executions: number };
}

interface ProjectListItem {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  baseUrl: string | null;
  browser: string;
  environment: string | null;
  framework: string;
  status: string;
  createdAt: Date;
  createdBy?: { id: string; name: string };
}

export class ProjectService {
  constructor(private repository: ProjectRepository) {}

  async create(dto: CreateProjectDTO, createdById: string) {
    const existingBySlug = await this.repository.findBySlug(dto.slug);
    if (existingBySlug) {
      throw new AppError(409, 'Project with this slug already exists');
    }

    const code = await this.generateNextCode();

    const created = await this.repository.create({
      code,
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      framework: dto.framework ?? 'PLAYWRIGHT',
      status: 'ACTIVE',
      // Automation
      baseUrl: dto.baseUrl,
      browser: dto.browser,
      environment: dto.environment,
      headless: dto.headless,
      timeout: dto.timeout,
      slowMo: dto.slowMo,
      viewportWidth: dto.viewportWidth,
      viewportHeight: dto.viewportHeight,
      debugMode: dto.debugMode,
      // Authentication
      authenticationEnabled: dto.authenticationEnabled,
      loginUrl: dto.loginUrl,
      loginEmail: dto.loginEmail,
      loginPassword: dto.loginPassword ? encryptSecret(dto.loginPassword) : null,
      loginMethod: dto.loginMethod,
      sessionStrategy: dto.sessionStrategy,
      createdById,
    });

    return this.toResponse(created);
  }

  async getById(id: string) {
    const project = await this.repository.findById(id);
    if (!project) {
      throw new AppError(404, 'Project not found');
    }
    return this.toResponse(project);
  }

  async getBySlug(slug: string) {
    const project = await this.repository.findBySlug(slug);
    if (!project) {
      throw new AppError(404, 'Project not found');
    }
    return this.toResponse(project);
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
    if (dto.framework !== undefined) updateData.framework = dto.framework;
    if (dto.status !== undefined) updateData.status = dto.status;
    // Automation
    if (dto.baseUrl !== undefined) updateData.baseUrl = dto.baseUrl;
    if (dto.browser !== undefined) updateData.browser = dto.browser;
    if (dto.environment !== undefined) updateData.environment = dto.environment;
    if (dto.headless !== undefined) updateData.headless = dto.headless;
    if (dto.timeout !== undefined) updateData.timeout = dto.timeout;
    if (dto.slowMo !== undefined) updateData.slowMo = dto.slowMo;
    if (dto.viewportWidth !== undefined) updateData.viewportWidth = dto.viewportWidth;
    if (dto.viewportHeight !== undefined) updateData.viewportHeight = dto.viewportHeight;
    if (dto.debugMode !== undefined) updateData.debugMode = dto.debugMode;
    // Authentication
    if (dto.authenticationEnabled !== undefined) updateData.authenticationEnabled = dto.authenticationEnabled;
    if (dto.loginUrl !== undefined) updateData.loginUrl = dto.loginUrl;
    if (dto.loginEmail !== undefined) updateData.loginEmail = dto.loginEmail;
    if (dto.loginPassword !== undefined) {
      updateData.loginPassword = dto.loginPassword ? encryptSecret(dto.loginPassword) : null;
    }
    if (dto.loginMethod !== undefined) updateData.loginMethod = dto.loginMethod;
    if (dto.sessionStrategy !== undefined) updateData.sessionStrategy = dto.sessionStrategy;

    const updated = await this.repository.update(id, updateData);
    return this.toResponse(updated);
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
      data: result.items.map((item) => this.toList(item)),
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }

  private toResponse(project: ProjectEntity): ProjectResponseDTO {
    return {
      id: project.id,
      code: project.code,
      name: project.name,
      slug: project.slug,
      description: project.description,
      status: project.status as ProjectResponseDTO['status'],
      framework: project.framework as ProjectResponseDTO['framework'],
      baseUrl: project.baseUrl,
      browser: project.browser as ProjectResponseDTO['browser'],
      environment: project.environment,
      headless: project.headless,
      timeout: project.timeout,
      slowMo: project.slowMo,
      viewportWidth: project.viewportWidth,
      viewportHeight: project.viewportHeight,
      debugMode: project.debugMode,
      authenticationEnabled: project.authenticationEnabled,
      loginUrl: project.loginUrl,
      loginEmail: project.loginEmail,
      loginMethod: project.loginMethod as ProjectResponseDTO['loginMethod'],
      sessionStrategy: project.sessionStrategy as ProjectResponseDTO['sessionStrategy'],
      loginPasswordSet: Boolean(project.loginPassword),
      createdById: project.createdById,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      createdBy: {
        id: project.createdBy?.id ?? '',
        name: project.createdBy?.name ?? '',
        email: project.createdBy?.email ?? '',
      },
    };
  }

  private toList(project: ProjectListItem): ProjectListDTO {
    return {
      id: project.id,
      code: project.code,
      name: project.name,
      slug: project.slug,
      description: project.description,
      baseUrl: project.baseUrl,
      browser: project.browser as ProjectListDTO['browser'],
      environment: project.environment,
      framework: project.framework as ProjectListDTO['framework'],
      status: project.status as ProjectListDTO['status'],
      createdAt: project.createdAt,
      createdBy: {
        id: project.createdBy?.id ?? '',
        name: project.createdBy?.name ?? '',
      },
    };
  }

  private async generateNextCode(): Promise<string> {
    const latest = await this.repository.findLatestCode();
    const nextNumber = latest ? parseInt(latest.code.replace('PROJ-', ''), 10) + 1 : 1;
    return `PROJ-${String(nextNumber).padStart(4, '0')}`;
  }
}