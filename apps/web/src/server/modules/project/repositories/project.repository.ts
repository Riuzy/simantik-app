import { PrismaClient, ProjectStatus } from '@prisma/client';
import { AppError } from '../../../middlewares/error-handler';
import { ProjectFilters } from '../types/project.dto';

export class ProjectRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    code: string;
    name: string;
    slug: string;
    description?: string;
    status?: ProjectStatus;
    startDate?: Date;
    endDate?: Date;
    createdById: string;
  }) {
    return this.prisma.project.create({
      data,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.project.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                jobTitle: true,
                role: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            testCases: true,
            testRuns: true,
            bugReports: true,
          },
        },
      },
    });
  }

  async update(id: string, data: Partial<{
    name: string;
    slug: string;
    description: string;
    status: ProjectStatus;
    startDate: Date;
    endDate: Date;
  }>) {
    const existing = await this.findById(id);
    if (!existing) {
      throw new AppError(404, 'Project not found');
    }

    return this.prisma.project.update({
      where: { id },
      data,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async softDelete(id: string) {
    const existing = await this.findById(id);
    if (!existing) {
      throw new AppError(404, 'Project not found');
    }

    return this.prisma.project.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async list(page: number, limit: number, filters: ProjectFilters = {}) {
    const skip = (page - 1) * limit;

    type WhereClause = {
      deletedAt: null;
      status?: ProjectStatus;
      createdById?: string;
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        code?: { contains: string; mode: 'insensitive' };
        slug?: { contains: string; mode: 'insensitive' };
        description?: { contains: string; mode: 'insensitive' };
      }>;
    };

    const where: WhereClause = {
      deletedAt: null,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.createdById) {
      where.createdById = filters.createdById;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { code: { contains: filters.search, mode: 'insensitive' } },
        { slug: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    type OrderByClause = {
      createdAt?: 'asc' | 'desc';
      name?: 'asc' | 'desc';
      updatedAt?: 'asc' | 'desc';
    };

    const orderBy: OrderByClause = {};
    orderBy[filters.sortBy || 'createdAt'] = filters.sortOrder || 'desc';

    const [items, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          code: true,
          name: true,
          slug: true,
          status: true,
          createdAt: true,
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      items,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByCode(code: string) {
    return this.prisma.project.findFirst({
      where: {
        code,
        deletedAt: null,
      },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.project.findFirst({
      where: {
        slug,
        deletedAt: null,
      },
    });
  }

  async addMember(projectId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Check if project exists
      const project = await tx.project.findFirst({
        where: { id: projectId, deletedAt: null },
      });
      if (!project) {
        throw new AppError(404, 'Project not found');
      }

      // Check if user exists
      const user = await tx.user.findFirst({
        where: { id: userId, deletedAt: null, isActive: true },
      });
      if (!user) {
        throw new AppError(404, 'User not found or inactive');
      }

      // Check if already a member
      const existingMember = await tx.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId,
          },
        },
      });

      if (existingMember) {
        throw new AppError(409, 'User is already a member of this project');
      }

      // Add member
      return tx.projectMember.create({
        data: {
          projectId,
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              jobTitle: true,
              role: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
    });
  }

  async removeMember(projectId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Check if project exists
      const project = await tx.project.findFirst({
        where: { id: projectId, deletedAt: null },
      });
      if (!project) {
        throw new AppError(404, 'Project not found');
      }

      // Check if user is a member
      const member = await tx.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId,
          },
        },
      });

      if (!member) {
        throw new AppError(404, 'User is not a member of this project');
      }

      // Remove member
      await tx.projectMember.delete({
        where: {
          projectId_userId: {
            projectId,
            userId,
          },
        },
      });
    });
  }

  async listMembers(projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, deletedAt: null },
    });
    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    return this.prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            jobTitle: true,
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });
  }

  async isMember(projectId: string, userId: string): Promise<boolean> {
    const member = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });
    return !!member;
  }
}