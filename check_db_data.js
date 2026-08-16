const fetch = require('node-fetch');

async function checkApi() {
  const orgId = 'clwsj7hax0000m9f1y1y1y1y1'; // Need a real orgId from DB
  const url = `http://localhost:3000/api/dashboard/summary?orgId=${orgId}`;
  
  // This won't work easily without a running server and session.
  // I'll check the DB instead.
}

async function checkDb() {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  try {
    const orgs = await prisma.organization.findMany();
    console.log('Orgs:', orgs.length);
    if (orgs.length > 0) {
      const orgId = orgs[0].id;
      const txs = await prisma.transaction.findMany({ where: { orgId } });
      console.log('Transactions for first org:', txs.length);
      
      const categories = await prisma.category.findMany({ where: { orgId } });
      console.log('Categories:', categories.length);
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkDb();
