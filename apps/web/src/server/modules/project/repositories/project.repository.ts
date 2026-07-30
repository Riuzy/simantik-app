import { PrismaClient } from '@prisma/client';
import { AppError } from '../../../middlewares/error-handler';
import { ProjectFilters } from '../types/project.dto';

export class ProjectRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    code: string;
    name: string;
    slug: string;
    description?: string;
    status: string;
    createdById: string;
  }) {
    return this.prisma.project.create({
      data: data as any,
      include: { createdBy: { select: { id: true, name: true, email: true } } },
    });
  }

  async findById(id: string) {
    return this.prisma.project.findFirst({
      where: { id, deletedAt: null },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true, jobTitle: true, role: { select: { id: true, name: true } } } },
          },
        },
        _count: { select: { members: true, testCases: true, testRuns: true, bugReports: true } },
      },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.project.findFirst({
      where: { slug, deletedAt: null },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true, jobTitle: true, role: { select: { id: true, name: true } } } },
          },
        },
        _count: { select: { members: true, testCases: true, testRuns: true, bugReports: true } },
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
      data: data as any,
      include: { createdBy: { select: { id: true, name: true, email: true } } },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.project.update({
      where: { id },
      data: { status: status as any },
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

    if (filters.memberId) {
      where.members = { some: { userId: filters.memberId } };
    }
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { code: { contains: filters.search } },
        { slug: { contains: filters.search } },
      ];
    }

    const orderBy: Record<string, string> = {};
    orderBy[filters.sortBy || 'createdAt'] = filters.sortOrder || 'desc';

    const [items, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where: where as any,
        skip,
        take: limit,
        orderBy: orderBy as any,
        select: {
          id: true,
          code: true,
          name: true,
          slug: true,
          description: true,
          status: true,
          createdAt: true,
          createdBy: { select: { id: true, name: true } },
        },
      }),
      this.prisma.project.count({ where: where as any }),
    ]);

    return { items, total, totalPages: Math.ceil(total / limit) };
  }

  async findByCode(code: string) {
    return this.prisma.project.findFirst({ where: { code, deletedAt: null } });
  }

  async findBySlug(slug: string) {
    return this.prisma.project.findFirst({ where: { slug, deletedAt: null } });
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

  async findBySlugOrThrow(slug: string) {
    const project = await this.findBySlug(slug);
    if (!project) throw new AppError(404, 'Project not found');
    return project;
  }

  async findBySlugOrThrowWithDetails(slug: string) {
    const project = await this.findBySlug(slug);
    if (!project) throw new AppError(404, 'Project not found');
    return project;
  }

  async listBySlug(page: number, limit: number, filters: ProjectFilters = {}) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { deletedAt: null };

    if (filters.memberId) {
      where.members = { some: { userId: filters.memberId } };
    }
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { code: { contains: filters.search } },
        { slug: { contains: filters.search } },
      ];
    }

    const orderBy: Record<string, string> = {};
    orderBy[filters.sortBy || 'createdAt'] = filters.sortOrder || 'desc';

    const [items, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where: where as any,
        skip,
        take: limit,
        orderBy: orderBy as any,
        select: {
          id: true, code: true, name: true, slug: true,
          description: true, status: true, createdAt: true,
          createdBy: { select: { id: true, name: true } },
        },
      }),
      this.prisma.project.count({ where: where as any }),
    ]);

    return { items, total, totalPages: Math.ceil(total / limit) };
  }

  async addMember(projectId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.findFirst({ where: { id: projectId, deletedAt: null } });
      if (!project) throw new AppError(404, 'Project not found');
      const user = await tx.user.findFirst({ where: { id: userId, deletedAt: null, isActive: true } });
      if (!user) throw new AppError(404, 'User not found or inactive');
      const existingMember = await tx.projectMember.findUnique({ where: { projectId_userId: { projectId, userId } } });
      if (existingMember) throw new AppError(409, 'User is already a member');
      return tx.projectMember.create({
        data: { projectId, userId },
        include: { user: { select: { id: true, name: true, email: true, avatar: true, jobTitle: true, role: { select: { id: true, name: true } } } } },
      });
    });
  }

  async removeMember(projectId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.findFirst({ where: { id: projectId, deletedAt: null } });
      if (!project) throw new AppError(404, 'Project not found');
      const member = await tx.projectMember.findUnique({ where: { projectId_userId: { projectId, userId } } });
      if (!member) throw new AppError(404, 'User is not a member');
      await tx.projectMember.delete({ where: { projectId_userId: { projectId, userId } } });
    });
  }

  async listMembers(projectId: string) {
    const project = await this.prisma.project.findFirst({ where: { id: projectId, deletedAt: null } });
    if (!project) throw new AppError(404, 'Project not found');
    return this.prisma.projectMember.findMany({
      where: { projectId },
      include: { user: { select: { id: true, name: true, email: true, avatar: true, jobTitle: true, role: { select: { id: true, name: true } } } } },
      orderBy: { joinedAt: 'desc' },
    });
  }

  async isMember(projectId: string, userId: string): Promise<boolean> {
    const member = await this.prisma.projectMember.findUnique({ where: { projectId_userId: { projectId, userId } } });
    return !!member;
  }

  async findAvailableMembers(projectId: string) {
    const assigned = await this.prisma.projectMember.findMany({ where: { projectId }, select: { userId: true } });
    const assignedIds = assigned.map((m) => m.userId);
    const roles = await this.prisma.role.findMany({ where: { name: { in: ['Developer', 'Tester'] } }, select: { id: true } });
    const roleIds = roles.map((r) => r.id);
    return this.prisma.user.findMany({
      where: { roleId: { in: roleIds }, id: { notIn: assignedIds }, deletedAt: null, isActive: true },
      select: { id: true, name: true, email: true, jobTitle: true, role: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    });
  }
}
