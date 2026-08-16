const fs = require('fs');
const path = require('path');

const files = [
  'src/components/projects/project-form.tsx',
  'src/components/transactions/transaction-form.tsx',
  'src/app/api/projects/route.ts',
  'src/app/api/projects/[id]/route.ts',
  'src/app/api/transactions/route.ts',
  'src/app/api/orgs/[orgId]/members/route.ts',
  'src/app/api/documents/route.ts',
  'src/app/(dashboard)/projects/page.tsx',
  'src/app/(dashboard)/documents/page.tsx',
  'src/app/(dashboard)/documents/new/page.tsx'
];

const ENUMS = [
  'PlanTier', 'OrgRole', 'ContactType', 'TransactionType', 'TxStatus',
  'ProjectStatus', 'PayStatus', 'DocumentType', 'DocStatus', 'TaskStatus', 'Priority'
];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    console.log('File not found:', file);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Regex to match imports from '@prisma/client'
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]@prisma\/client['"]/g;
  
  content = content.replace(importRegex, (match, importsStr) => {
    const imports = importsStr.split(',').map(s => s.trim());
    const enumImports = [];
    const otherImports = [];
    
    imports.forEach(imp => {
      if (ENUMS.includes(imp)) {
        enumImports.push(imp);
      } else {
        otherImports.push(imp);
      }
    });
    
    let replacement = '';
    if (enumImports.length > 0) {
      replacement += `import { ${enumImports.join(', ')} } from '@/types'`;
    }
    if (otherImports.length > 0) {
      if (replacement !== '') replacement += '\n';
      replacement += `import { ${otherImports.join(', ')} } from '@prisma/client'`;
    }
    
    console.log(`Replaced in ${file}: ${match} -> ${replacement}`);
    return replacement;
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Finished fixing imports.');
