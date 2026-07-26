import { PrismaClient } from '@prisma/client';
import { AppError } from '../../../middlewares/error-handler';
import { UserFilters } from '../types/user.dto';

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  private readonly baseSelect = {
    id: true,
    name: true,
    email: true,
    avatar: true,
    phoneNumber: true,
    jobTitle: true,
    bio: true,
    isActive: true,
    mustChangePassword: true,
    lastLoginAt: true,
    createdAt: true,
    updatedAt: true,
    roleId: true,
    role: {
      select: {
        id: true,
        name: true,
      },
    },
  };

  private readonly listSelect = {
    id: true,
    name: true,
    email: true,
    avatar: true,
    jobTitle: true,
    isActive: true,
    mustChangePassword: true,
    lastLoginAt: true,
    createdAt: true,
    role: {
      select: {
        id: true,
        name: true,
      },
    },
  };

  async create(data: {
    name: string;
    email: string;
    password: string;
    phoneNumber: string | null;
    jobTitle: string | null;
    avatar: string | null;
    roleId: string;
    mustChangePassword: boolean;
  }) {
    const createData: {
      name: string;
      email: string;
      password: string;
      phoneNumber: string | null;
      jobTitle: string | null;
      avatar: string | null;
      roleId: string;
      mustChangePassword: boolean;
      tokenVersion: number;
    } = {
      ...data,
      tokenVersion: 0,
    };
    
    return this.prisma.user.create({
      data: createData,
      select: this.baseSelect,
    });
  }

  async findById(id: string) {
    return this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: this.baseSelect,
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, data: Partial<{
    name: string;
    phoneNumber: string | null;
    jobTitle: string | null;
    bio: string | null;
    isActive: boolean;
    roleId: string;
  }>) {
    const existing = await this.findById(id);
    if (!existing) {
      throw new AppError(404, 'User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: this.baseSelect,
    });
  }

  async updatePassword(userId: string, hashedPassword: string, mustChangePassword: boolean) {
    const updateData: {
      password: string;
      mustChangePassword: boolean;
    } = {
      password: hashedPassword,
      mustChangePassword,
    };
    
    return this.prisma.user.update({
      where: { id: userId },
        data: updateData,
    });
  }

  async softDelete(id: string) {
    const existing = await this.findById(id);
    if (!existing) {
      throw new AppError(404, 'User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  async list(page: number, limit: number, filters: UserFilters = {}) {
    const skip = (page - 1) * limit;

    type WhereClause = {
      deletedAt: null;
      roleId?: string;
      isActive?: boolean;
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        email?: { contains: string; mode: 'insensitive' };
        jobTitle?: { contains: string; mode: 'insensitive' };
      }>;
    };

    const where: WhereClause = {
      deletedAt: null,
    };

    if (filters.roleId) {
      where.roleId = filters.roleId;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { jobTitle: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: this.listSelect,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findRoleById(roleId: string) {
    return this.prisma.role.findUnique({
      where: { id: roleId },
    });
  }

  async findAllRoles() {
    return this.prisma.role.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
      },
    });
  }
}