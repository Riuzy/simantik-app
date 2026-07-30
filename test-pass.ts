import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { email: true, password: true } });
  console.log('Users found:', users.length);
  for (const u of users) {
    const valid = await bcrypt.compare('Password123!', u.password);
    console.log(u.email, 'password match Password123!:', valid);
    const valid2 = await bcrypt.compare('Manager123!', u.password);
    console.log(u.email, 'password match Manager123!:', valid2);
  }
  await prisma.$disconnect();
}
main().catch(e => console.error('Error:', e));
