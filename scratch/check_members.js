const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    console.log('--- Organization Members Audit ---');
    const members = await prisma.orgMember.findMany({
      include: {
        user: true,
        org: true
      }
    });

    members.forEach(m => {
      console.log(`Org: ${m.org.name} | User: ${m.user.name} (${m.user.email}) | Role: ${m.role}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
