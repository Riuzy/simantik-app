import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '../../../middlewares/error-handler';
import { ProjectFilters } from '../types/project.dto';

export class ProjectRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    code: string;
    name: string;
    slug: string;
    description?: string;
    baseUrl?: string;
    framework: string;
    environment?: string;
    status: string;
    createdById: string;
  }) {
    const { createdById, ...rest } = data;
    return this.prisma.project.create({
      data: {
        ...(rest as Prisma.ProjectCreateWithoutCreatedByInput),
        createdBy: { connect: { id: createdById } },
      },
      include: { createdBy: { select: { id: true, name: true, email: true, avatar: true } } },
    });
  }

  async findById(id: string) {
    return this.prisma.project.findFirst({
      where: { id, deletedAt: null },
      include: {
        createdBy: { select: { id: true, name: true, email: true, avatar: true } },
        automationConfig: true,
        _count: { select: { testCases: true, executions: true } },
      },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.project.findFirst({
      where: { slug, deletedAt: null },
      include: {
        createdBy: { select: { id: true, name: true, email: true, avatar: true } },
        automationConfig: true,
        _count: { select: { testCases: true, executions: true } },
      },
    });
  }

  async findBySlugOrThrow(slug: string) {
    const project = await this.findBySlug(slug);
    if (!project) throw new AppError(404, 'Project not found');
    return project;
  }

  async update(id: string, data: Record<string, unknown>) {
    const existing = await this.findById(id);
    if (!existing) throw new AppError(404, 'Project not found');
    return this.prisma.project.update({
      where: { id },
      data: data as Prisma.ProjectUpdateInput,
      include: { createdBy: { select: { id: true, name: true, email: true } } },
    });
  }

  async softDelete(id: string) {
    const existing = await this.findById(id);
    if (!existing) throw new AppError(404, 'Project not found');
    return this.prisma.project.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async list(page: number, limit: number, filters: ProjectFilters = {}) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { deletedAt: null };

    if (filters.status) where.status = filters.status;
    if (filters.framework) where.framework = filters.framework;
    if (filters.createdById) where.createdById = filters.createdById;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { code: { contains: filters.search } },
        { slug: { contains: filters.search } },
      ];
    }

    const orderBy: Record<string, 'asc' | 'desc'> = {};
    orderBy[filters.sortBy || 'createdAt'] = filters.sortOrder || 'desc';

    const [items, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where: where as Prisma.ProjectWhereInput,
        skip,
        take: limit,
        orderBy: [orderBy as Prisma.ProjectOrderByWithRelationInput],
        select: {
          id: true,
          code: true,
          name: true,
          slug: true,
          description: true,
          baseUrl: true,
          framework: true,
          environment: true,
          status: true,
          createdAt: true,
          createdBy: { select: { id: true, name: true } },
        },
      }),
      this.prisma.project.count({ where: where as Prisma.ProjectWhereInput }),
    ]);

    return { items, total, totalPages: Math.ceil(total / limit) };
  }

  async findLatestCode() {
    return this.prisma.project.findFirst({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: { code: true },
    });
  }

  async findByIdOrThrow(id: string) {
    const project = await this.findById(id);
    if (!project) throw new AppError(404, 'Project not found');
    return project;
  }

  async findBySlugOrThrowWithDetails(slug: string) {
    const project = await this.findBySlug(slug);
    if (!project) throw new AppError(404, 'Project not found');
    return project;
  }
}
