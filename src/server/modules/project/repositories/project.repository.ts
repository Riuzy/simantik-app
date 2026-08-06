import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '../../../middlewares/error-handler';
import { ProjectFilters } from '../types/project.dto';

export class ProjectRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    code: string;
    name: string;
    slug: string;
    description?: string | null;
    framework: string;
    status: string;
    baseUrl?: string | null;
    browser?: string;
    environment?: string | null;
    headless?: boolean;
    timeout?: number;
    slowMo?: number;
    viewportWidth?: number;
    viewportHeight?: number;
    screenshotTiming?: string;
    debugMode?: boolean;
    authenticationEnabled?: boolean;
    loginUrl?: string | null;
    loginEmail?: string | null;
    loginPassword?: string | null;
    loginMethod?: string;
    sessionStrategy?: string;
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
        _count: { select: { testCases: true, executions: true } },
      },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.project.findFirst({
      where: { slug, deletedAt: null },
      include: {
        createdBy: { select: { id: true, name: true, email: true, avatar: true } },
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

  async getProjectStats(projectIds: string[]) {
    if (projectIds.length === 0) {
      return {
        executions: new Map<string, { passed: number; failed: number; error: number; total: number }>(),
        automationCounts: new Map<string, number>(),
      };
    }

    const [execGroup, automationGroup] = await Promise.all([
      this.prisma.execution.groupBy({
        by: ['projectId', 'status'],
        where: { projectId: { in: projectIds }, deletedAt: null },
        orderBy: { projectId: 'asc' },
        _count: { _all: true },
      }),
      this.prisma.testCase.groupBy({
        by: ['projectId'],
        where: { projectId: { in: projectIds }, deletedAt: null, type: 'AUTOMATION' },
        orderBy: { projectId: 'asc' },
        _count: { _all: true },
      }),
    ]);

    const executions = new Map<string, { passed: number; failed: number; error: number; total: number }>();
    for (const row of execGroup) {
      const count = (row._count as { _all?: number } | undefined)?._all ?? 0;
      const entry = executions.get(row.projectId) ?? { passed: 0, failed: 0, error: 0, total: 0 };
      entry.total += count;
      if (row.status === 'PASSED') entry.passed += count;
      if (row.status === 'FAILED') entry.failed += count;
      if (row.status === 'ERROR') entry.error += count;
      executions.set(row.projectId, entry);
    }

    const automationCounts = new Map<string, number>();
    for (const row of automationGroup) {
      automationCounts.set(row.projectId, (row._count as { _all?: number } | undefined)?._all ?? 0);
    }

    return { executions, automationCounts };
  }

  async list(page: number, limit: number, filters: ProjectFilters = {}) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { deletedAt: null };

    if (filters.status) where.status = filters.status;
    if (filters.framework) where.framework = filters.framework;
    if (filters.browser) where.browser = filters.browser;
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
          browser: true,
          environment: true,
          framework: true,
          status: true,
          createdAt: true,
          createdBy: { select: { id: true, name: true } },
          _count: { select: { testCases: true, executions: true } },
        },
      }),
      this.prisma.project.count({ where: where as Prisma.ProjectWhereInput }),
    ]);

    return { items, total, totalPages: Math.ceil(total / limit) };
  }

  async findLatestCode() {
    return this.prisma.project.findFirst({
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