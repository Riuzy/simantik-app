import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const projects = await prisma.project.findMany({
      where: { deletedAt: null },
      take: 10,
      select: { id: true, code: true, name: true, slug: true, status: true, createdAt: true }
    });
    console.log('Projects:', JSON.stringify(projects, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}