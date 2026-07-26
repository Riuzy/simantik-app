import { PrismaClient } from '@prisma/client';

export class AuthRepository {
  constructor(private prisma: PrismaClient) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async updateLastLogin(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date(),
      },
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
}