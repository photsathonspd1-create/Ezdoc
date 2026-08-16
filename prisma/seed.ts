// Prisma seed script for WorkflowOS
import { PrismaClient } from '@prisma/client'
import { PlanTier, OrgRole, ContactType, TransactionType, TxStatus, ProjectStatus, PayStatus } from '../src/types'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Cleanup existing demo data to prevent duplication
  console.log('Cleaning up existing demo data...')
  await prisma.aiInsight.deleteMany({ where: { orgId: 'demo-org-unizin-123' } })
  await prisma.transaction.deleteMany({ where: { orgId: 'demo-org-unizin-123' } })
  await prisma.project.deleteMany({ where: { orgId: 'demo-org-unizin-123' } })
  await prisma.contact.deleteMany({ where: { orgId: 'demo-org-unizin-123' } })
  await prisma.category.deleteMany({ where: { orgId: 'demo-org-unizin-123' } })
  await prisma.orgMember.deleteMany({ where: { orgId: 'demo-org-unizin-123' } })
  console.log('Cleanup completed.')

  // 1. Create Demo Owner User
  const user = await prisma.user.upsert({
    where: { email: 'owner@unizin.co.th' },
    update: {},
    create: {
      supabaseId: 'demo-supabase-uuid-owner-1234',
      email: 'owner@unizin.co.th',
      name: 'สมชาย นามดี',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      phone: '0812345678',
    },
  })
  console.log(`Created user: ${user.name}`)

  // 2. Create Organization
  const org = await prisma.organization.upsert({
    where: { id: 'demo-org-unizin-123' },
    update: {},
    create: {
      id: 'demo-org-unizin-123',
      name: 'บริษัท ยูนิซิน จำกัด',
      taxId: '0105560000000',
      address: '123/45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110',
      phone: '021234567',
      email: 'contact@unizin.co.th',
      website: 'www.unizin.co.th',
      planTier: PlanTier.PRO,
    },
  })
  console.log(`Created organization: ${org.name}`)

  // 3. Create Org Member (Owner)
  await prisma.orgMember.upsert({
    where: {
      orgId_userId: {
        orgId: org.id,
        userId: user.id,
      },
    },
    update: {},
    create: {
      orgId: org.id,
      userId: user.id,
      role: OrgRole.OWNER,
    },
  })

  // 4. Default Categories
  const categoriesList = [
    { name: 'รายได้จากบริการ', type: TransactionType.INCOME, color: '#22c55e', icon: 'wrench', isDefault: true },
    { name: 'ขายสินค้า', type: TransactionType.INCOME, color: '#3b82f6', icon: 'shopping-bag', isDefault: true },
    { name: 'รายได้อื่นๆ', type: TransactionType.INCOME, color: '#a855f7', icon: 'coins', isDefault: true },
    { name: 'เงินเดือนพนักงาน', type: TransactionType.EXPENSE, color: '#ef4444', icon: 'users', isDefault: true },
    { name: 'ค่าวัตถุดิบ', type: TransactionType.EXPENSE, color: '#f97316', icon: 'package', isDefault: true },
    { name: 'ค่าการตลาด', type: TransactionType.EXPENSE, color: '#eab308', icon: 'megaphone', isDefault: true },
    { name: 'ค่าเช่า', type: TransactionType.EXPENSE, color: '#6366f1', icon: 'building', isDefault: true },
    { name: 'สาธารณูปโภค', type: TransactionType.EXPENSE, color: '#06b6d4', icon: 'droplet', isDefault: true },
    { name: 'อื่นๆ', type: TransactionType.EXPENSE, color: '#6b7280', icon: 'more-horizontal', isDefault: true },
  ]

  const categoriesMap: Record<string, string> = {}
  for (const cat of categoriesList) {
    const dbCat = await prisma.category.create({
      data: {
        orgId: org.id,
        name: cat.name,
        type: cat.type,
        color: cat.color,
        icon: cat.icon,
        isDefault: cat.isDefault,
      },
    })
    categoriesMap[cat.name] = dbCat.id
  }
  console.log('Created default categories')

  // 5. Create Contacts
  const contact1 = await prisma.contact.create({
    data: {
      orgId: org.id,
      name: 'บริษัท สยามพาร์ทเนอร์ส จำกัด',
      type: ContactType.COMPANY,
      taxId: '0105559000111',
      address: '88/8 อาคารสยามสแควร์ ชั้น 10 ถนนพญาไท แขวงปทุมวัน เขตปทุมวัน กรุงเทพฯ 10330',
      email: 'finance@siampartners.co.th',
      phone: '028888888',
      notes: 'ลูกค้ารายใหญ่สำหรับบริการให้คำปรึกษา',
    },
  })

  const contact2 = await prisma.contact.create({
    data: {
      orgId: org.id,
      name: 'ห้างหุ้นส่วนจำกัด ไทยซัพพลาย',
      type: ContactType.COMPANY,
      taxId: '0103558000222',
      address: '456 หมู่ 5 ถนนพัฒนาการ แขวงประเวศ เขตประเวศ กรุงเทพฯ 10250',
      email: 'sales@thaisupply.com',
      phone: '027777777',
      notes: 'คู่ค้าหลักสำหรับวัตถุดิบและอุปกรณ์',
    },
  })
  console.log('Created sample contacts')

  // 6. Create Projects
  const project1 = await prisma.project.create({
    data: {
      orgId: org.id,
      name: 'ระบบคลาวด์องค์กร Siam Partners',
      clientId: contact1.id,
      status: ProjectStatus.ACTIVE,
      budget: 350000.00,
      paidAmount: 150000.00,
      paymentStatus: PayStatus.PARTIAL,
      startDate: new Date('2026-03-01'),
      dueDate: new Date('2026-08-31'),
      tags: JSON.stringify(['Cloud', 'SiamPartners']),
      notes: 'โปรเจกต์พัฒนาระบบคลาวด์และย้ายฐานข้อมูล',
    },
  })

  const project2 = await prisma.project.create({
    data: {
      orgId: org.id,
      name: 'ปรับปรุงเว็บไซต์และระบบ CRM',
      clientId: contact1.id,
      status: ProjectStatus.PENDING,
      budget: 180000.00,
      paidAmount: 0.00,
      paymentStatus: PayStatus.UNPAID,
      startDate: new Date('2026-06-01'),
      dueDate: new Date('2026-09-30'),
      tags: JSON.stringify(['CRM', 'Website']),
      notes: 'เตรียมเสนอราคาและรายละเอียดโครงการ',
    },
  })
  console.log('Created sample projects')

  // 7. Create 10 realistic Transactions
  const txData = [
    {
      type: TransactionType.INCOME,
      amount: 150000.00,
      description: 'รับชำระงวดที่ 1: ระบบคลาวด์องค์กร Siam Partners',
      categoryName: 'รายได้จากบริการ',
      date: new Date('2026-03-15'),
      paymentMethod: 'โอนเงินผ่านธนาคาร',
      projectId: project1.id,
    },
    {
      type: TransactionType.INCOME,
      amount: 85000.00,
      description: 'ยอดขายสินค้าล็อต A',
      categoryName: 'ขายสินค้า',
      date: new Date('2026-05-02'),
      paymentMethod: 'โอนเงินผ่านธนาคาร',
    },
    {
      type: TransactionType.EXPENSE,
      amount: 45000.00,
      description: 'จ่ายเงินเดือนวิศวกรซอฟต์แวร์ (พฤษภาคม)',
      categoryName: 'เงินเดือนพนักงาน',
      date: new Date('2026-05-25'),
      paymentMethod: 'โอนเงินผ่านธนาคาร',
    },
    {
      type: TransactionType.EXPENSE,
      amount: 25000.00,
      description: 'จ่ายค่าเช่าออฟฟิศประจำเดือนพฤษภาคม',
      categoryName: 'ค่าเช่า',
      date: new Date('2026-05-01'),
      paymentMethod: 'โอนเงินผ่านธนาคาร',
    },
    {
      type: TransactionType.EXPENSE,
      amount: 12500.00,
      description: 'ซื้ออุปกรณ์สำนักงานและวัสดุสิ้นเปลือง',
      categoryName: 'ค่าวัตถุดิบ',
      date: new Date('2026-05-10'),
      paymentMethod: 'บัตรเครดิต',
    },
    {
      type: TransactionType.EXPENSE,
      amount: 8500.00,
      description: 'ค่าโฆษณา Facebook & Google Ads',
      categoryName: 'ค่าการตลาด',
      date: new Date('2026-05-18'),
      paymentMethod: 'บัตรเครดิต',
    },
    {
      type: TransactionType.EXPENSE,
      amount: 4200.00,
      description: 'จ่ายค่าน้ำไฟและอินเทอร์เน็ตประจำเดือน',
      categoryName: 'สาธารณูปโภค',
      date: new Date('2026-05-20'),
      paymentMethod: 'หักบัญชีอัตโนมัติ',
    },
    {
      type: TransactionType.INCOME,
      amount: 25000.00,
      description: 'รับชำระค่าบริการบำรุงรักษารายปี',
      categoryName: 'รายได้จากบริการ',
      date: new Date('2026-05-22'),
      paymentMethod: 'โอนเงินผ่านธนาคาร',
    },
    {
      type: TransactionType.INCOME,
      amount: 12000.00,
      description: 'ขายเศษกล่องและอุปกรณ์ที่ไม่ได้ใช้งาน',
      categoryName: 'รายได้อื่นๆ',
      date: new Date('2026-05-22'),
      paymentMethod: 'เงินสด',
    },
    {
      type: TransactionType.EXPENSE,
      amount: 15000.00,
      description: 'ค่ามัดจำอุปกรณ์เซิร์ฟเวอร์ใหม่',
      categoryName: 'ค่าวัตถุดิบ',
      date: new Date('2026-05-22'),
      paymentMethod: 'โอนเงินผ่านธนาคาร',
    },
  ]

  for (const tx of txData) {
    const vatRate = 7
    const vatAmount = (tx.amount * vatRate) / 107
    const amountExVat = tx.amount - vatAmount

    await prisma.transaction.create({
      data: {
        orgId: org.id,
        type: tx.type,
        amount: tx.amount,
        vatRate,
        vatAmount,
        amountExVat,
        description: tx.description,
        categoryId: categoriesMap[tx.categoryName] || null,
        date: tx.date,
        paymentMethod: tx.paymentMethod,
        status: TxStatus.COMPLETED,
        projectId: tx.projectId || null,
        createdById: user.id,
      },
    })
  }
  console.log('Created sample transactions')

  // 8. Create some sample AI insights
  await prisma.aiInsight.createMany({
    data: [
      {
        orgId: org.id,
        type: 'positive_trend',
        title: 'แนวโน้มรายรับเพิ่มขึ้น',
        content: 'รายได้รวมประจำเดือนนี้เพิ่มขึ้น 18.5% จากการรับชำระงวดที่ 1 ของระบบคลาวด์องค์กร Siam Partners',
        isRead: false,
      },
      {
        orgId: org.id,
        type: 'warning',
        title: 'ค่าใช้จ่ายการตลาดเพิ่มขึ้นอย่างรวดเร็ว',
        content: 'ค่าโฆษณา Facebook & Google Ads เพิ่มขึ้น 22% เมื่อเทียบกับเดือนก่อนหน้า ควรตรวจสอบ ROAS',
        isRead: false,
      },
      {
        orgId: org.id,
        type: 'reminder',
        title: 'กำหนดส่งภาษีมูลค่าเพิ่ม (ภ.พ.30)',
        content: 'คุณมีหน้าที่ยื่นแบบ ภ.พ.30 ภายในวันที่ 15 ของเดือนหน้า ปัจจุบันมีภาษีขายสะสมที่ ฿16,028.00',
        isRead: false,
      },
    ],
  })
  console.log('Created sample AI insights')

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
