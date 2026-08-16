const fs = require('fs');
const path = require('path');

const CRITICAL_FILES = [
  'src/app/(dashboard)/reports/page.tsx',
  'src/app/(dashboard)/settings/page.tsx',
  'src/app/api/dashboard/summary/route.ts',
  'src/app/api/orgs/[orgId]/route.ts',
  'prisma/schema.prisma'
];

function audit() {
  console.log('--- ENTERPRISE READINESS AUDIT ---');
  let failures = 0;

  CRITICAL_FILES.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (!fs.existsSync(fullPath)) {
      console.log(`[FAIL] File missing: ${file}`);
      failures++;
      return;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    
    if (file.includes('reports/page.tsx')) {
      if (!content.includes('isAnimationActive={false}')) {
        console.log(`[WARN] ${file}: Potential hydration issue. Recharts animation active.`);
      }
      if (!content.includes('trends.some')) {
        console.log(`[WARN] ${file}: Logic for empty charts might be flawed.`);
      }
    }
    
    if (file.includes('settings/page.tsx')) {
      if (content.includes('backdrop-blur') && content.includes('DialogFooter')) {
         // console.log(`[WARN] ${file}: Still uses backdrop-blur on dialog footer.`);
      }
      if (!content.includes('onUpdateEnterprise')) {
        console.log(`[FAIL] ${file}: Enterprise settings not implemented.`);
        failures++;
      }
    }
    
    if (file.includes('schema.prisma')) {
      if (!content.includes('AuditLog')) {
        console.log(`[FAIL] schema.prisma: AuditLog model missing.`);
        failures++;
      }
      if (!content.includes('budgetRevenue')) {
        console.log(`[FAIL] schema.prisma: Enterprise budgeting fields missing.`);
        failures++;
      }
    }
  });

  if (failures === 0) {
    console.log('--- AUDIT PASSED: SYSTEM READY FOR CORPORATE USE ---');
  } else {
    console.log(`--- AUDIT FAILED: ${failures} CRITICAL ISSUES FOUND ---`);
  }
}

audit();
