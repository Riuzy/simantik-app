import { PrismaClient } from '@prisma/client';

export const ROLES = ['Manager', 'Developer', 'Tester'] as const;

export async function RoleSeeder(prisma: PrismaClient): Promise<void> {
  for (const name of ROLES) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`Roles: ${ROLES.join(', ')}`);
}
