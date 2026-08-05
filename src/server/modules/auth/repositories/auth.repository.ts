import { PrismaClient } from '@prisma/client';

export class AuthRepository {
  constructor(private prisma: PrismaClient) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updateLastLogin(id: string) {
    return this.prisma.user.update({ where: { id }, data: { lastLoginAt: new Date() } });
  }

  async updatePassword(id: string, hashedPassword: string, mustChangePassword: boolean) {
    return this.prisma.user.update({ where: { id }, data: { password: hashedPassword, mustChangePassword } });
  }

  async updateProfile(id: string, data: { name?: string; email?: string; avatar?: string | null }) {
    return this.prisma.user.update({ where: { id }, data });
  }
}
