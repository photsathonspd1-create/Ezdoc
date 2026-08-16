const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  const r = await prisma.transaction.deleteMany({ where: { description: 'Enterprise License - TEST' } });
  console.log('Deleted:', r.count);
  await prisma.$disconnect();
}

cleanup();
