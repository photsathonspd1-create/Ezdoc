const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    console.log('🌱 Seeding specific roles: Staff, Head, Admin, Boss...');
    
    // Find the first organization
    const org = await prisma.organization.findFirst();
    if (!org) {
      console.log('🔴 No organization found to seed members into!');
      return;
    }

    console.log(`Using Organization: ${org.name} (${org.id})`);

    // Define users to seed
    const usersToSeed = [
      { email: 'staff@unizin.co.th', name: 'พนักงาน ดีเด่น', role: 'MEMBER' },
      { email: 'head@unizin.co.th', name: 'หัวหน้า สมพร', role: 'HEAD' },
      { email: 'admin@unizin.co.th', name: 'แอดมิน เก่งกาจ', role: 'ADMIN' },
      { email: 'boss2@unizin.co.th', name: 'บอส พิเศษ', role: 'OWNER' }
    ];

    for (const u of usersToSeed) {
      // Create or find user
      const dbUser = await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: {
          email: u.email,
          name: u.name
        }
      });

      // Upsert membership
      const membership = await prisma.orgMember.upsert({
        where: {
          orgId_userId: {
            orgId: org.id,
            userId: dbUser.id
          }
        },
        update: {
          role: u.role
        },
        create: {
          orgId: org.id,
          userId: dbUser.id,
          role: u.role
        }
      });

      console.log(`✅ Seeded member: ${dbUser.name} (${dbUser.email}) with role: ${membership.role}`);
    }

    console.log('🎉 Seeding roles successfully completed!');
  } catch (err) {
    console.error('🔴 Error seeding roles:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
