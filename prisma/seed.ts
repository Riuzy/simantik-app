import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcrypt');
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log('Seeding...');
  const password = await hashPassword('Password123!');

  await prisma.user.upsert({
    where: { email: 'tester@simantik.local' },
    update: { name: 'Software Tester', isActive: true, mustChangePassword: false },
    create: {
      name: 'Software Tester',
      email: 'tester@simantik.local',
      password,
      isActive: true,
      tokenVersion: 0,
      mustChangePassword: false,
    },
  });

  console.log('User: tester@simantik.local / Password123!');
  console.log('Done');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
