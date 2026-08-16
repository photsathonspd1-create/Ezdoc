const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRecentTransactions() {
  const txs = await prisma.transaction.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { org: true }
  });
  console.log(JSON.stringify(txs, null, 2));
  await prisma.$disconnect();
}

checkRecentTransactions();
