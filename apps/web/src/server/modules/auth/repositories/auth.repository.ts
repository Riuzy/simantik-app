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
}
