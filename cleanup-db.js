const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const orgs = await prisma.organization.findMany({ orderBy: { createdAt: 'asc' } });
  if (orgs.length > 1) {
    const toDelete = orgs.slice(0, -1);
    console.log(`Deleting ${toDelete.length} old organizations...`);
    for (const org of toDelete) {
      await prisma.organization.delete({ where: { id: org.id } });
    }
  }
  console.log('Clean up complete.');
  await prisma.$disconnect();
}

main();
