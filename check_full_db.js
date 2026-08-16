const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    console.log('--- Database Audit ---');
    const users = await prisma.user.count();
    const orgs = await prisma.organization.count();
    const members = await prisma.orgMember.count();
    const contacts = await prisma.contact.count();
    const categories = await prisma.category.count();
    const transactions = await prisma.transaction.count();
    const projects = await prisma.project.count();
    const documents = await prisma.document.count();
    const tasks = await prisma.task.count();
    const aiInsights = await prisma.aiInsight.count();
    const chatSessions = await prisma.chatSession.count();
    const chatMessages = await prisma.chatMessage.count();
    const auditLogs = await prisma.auditLog.count();

    console.log(`Users: ${users}`);
    console.log(`Organizations: ${orgs}`);
    console.log(`OrgMembers: ${members}`);
    console.log(`Contacts: ${contacts}`);
    console.log(`Categories: ${categories}`);
    console.log(`Transactions: ${transactions}`);
    console.log(`Projects: ${projects}`);
    console.log(`Documents: ${documents}`);
    console.log(`Tasks: ${tasks}`);
    console.log(`AiInsights: ${aiInsights}`);
    console.log(`ChatSessions: ${chatSessions}`);
    console.log(`ChatMessages: ${chatMessages}`);
    console.log(`AuditLogs: ${auditLogs}`);
    
    if (orgs > 0) {
      console.log('\n--- Detail of First Organization ---');
      const firstOrg = await prisma.organization.findFirst();
      console.log('ID:', firstOrg.id);
      console.log('Name:', firstOrg.name);
      console.log('Tax ID:', firstOrg.taxId);
      console.log('Plan Tier:', firstOrg.planTier);
    }
  } catch (err) {
    console.error('Error reading database:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
