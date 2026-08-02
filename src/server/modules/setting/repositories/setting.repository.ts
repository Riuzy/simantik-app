import { PrismaClient, Prisma } from '@prisma/client';

export class SettingRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll() {
    return this.prisma.setting.findMany({ orderBy: { key: 'asc' } });
  }

  async findByKey(key: string) {
    return this.prisma.setting.findUnique({ where: { key } });
  }

  async upsert(key: string, value: unknown) {
    return this.prisma.setting.upsert({
      where: { key },
      create: { key, value: value as Prisma.InputJsonValue },
      update: { value: value as Prisma.InputJsonValue },
    });
  }

  async delete(key: string) {
    return this.prisma.setting.delete({ where: { key } });
  }
}
