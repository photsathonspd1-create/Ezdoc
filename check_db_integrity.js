const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- DATABASE INTEGRITY AUDIT ---');
  
  // 1. Get Organization Info
  const org = await prisma.organization.findFirst();
  console.log(`Organization: ${org.name} (${org.planTier})`);

  // 2. Get Transaction Summary for May 2026
  const startOfMonth = new Date('2026-05-01T00:00:00Z');
  const endOfMonth = new Date('2026-05-31T23:59:59Z');

  const transactions = await prisma.transaction.findMany({
    where: {
      date: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    }
  });

  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach(tx => {
    if (tx.type === 'INCOME') {
      totalIncome += tx.amount;
    } else if (tx.type === 'EXPENSE') {
      totalExpense += tx.amount;
    }
  });

  console.log(`Month: May 2026`);
  console.log(`Total Income: ${totalIncome.toLocaleString()} THB`);
  console.log(`Total Expense: ${totalExpense.toLocaleString()} THB`);
  console.log(`Net Profit: ${(totalIncome - totalExpense).toLocaleString()} THB`);
  console.log(`Transaction Count: ${transactions.length}`);

  // 3. Compare with Chatbot's Mock Response
  // Mock Response was: รายรับ 450,000, รายจ่าย 120,000, กำไร 330,000
  const mockIncome = 450000;
  const mockExpense = 120000;

  if (totalIncome === mockIncome && totalExpense === mockExpense) {
    console.log('RESULT: Chatbot data is FACTUALLY ACCURATE (matches DB).');
  } else {
    console.log('RESULT: Chatbot data is INACCURATE (DISCREPANCY DETECTED).');
    console.log(`Difference Income: ${totalIncome - mockIncome}`);
    console.log(`Difference Expense: ${totalExpense - mockExpense}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
