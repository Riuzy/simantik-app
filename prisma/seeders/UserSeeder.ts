import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

interface UserSeed {
  name: string;
  email: string;
  roleName: string;
  jobTitle: string;
}

const USER_SEEDS: UserSeed[] = [
  { name: 'System Manager', email: 'manager@simantik.local', roleName: 'Manager', jobTitle: 'QA Manager' },
  { name: 'System Developer', email: 'developer@simantik.local', roleName: 'Developer', jobTitle: 'Software Developer' },
  { name: 'System Tester', email: 'tester@simantik.local', roleName: 'Tester', jobTitle: 'QA Engineer' },
];

const PASSWORD = 'Password123!';

export async function UserSeeder(prisma: PrismaClient): Promise<void> {
  const hashedPassword = await bcrypt.hash(PASSWORD, 10);

  for (const seed of USER_SEEDS) {
    const role = await prisma.role.findUnique({ where: { name: seed.roleName } });
    if (!role) { console.warn(`  ${seed.email}: role "${seed.roleName}" not found, skipping`); continue; }

    await prisma.user.upsert({
      where: { email: seed.email },
      update: {
        name: seed.name,
        jobTitle: seed.jobTitle,
        roleId: role.id,
        isActive: true,
        mustChangePassword: false,
      },
      create: {
        name: seed.name,
        email: seed.email,
        password: hashedPassword,
        roleId: role.id,
        jobTitle: seed.jobTitle,
        isActive: true,
        tokenVersion: 0,
        mustChangePassword: false,
      },
    });
  }

  console.log(`Users: ${USER_SEEDS.length} (Manager, Developer, Tester)`);
}
