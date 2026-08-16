const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const fs = require('fs');
const prisma = new PrismaClient();

async function generateChartChat() {
  // 1. Get Trends
  const start = new Date('2026-01-01');
  const txs = await prisma.transaction.findMany({
    where: { date: { gte: start }, status: 'COMPLETED' }
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const data = months.map((m, i) => {
    const startM = new Date(2026, i, 1);
    const endM = new Date(2026, i + 1, 0);
    const mtxs = txs.filter(t => t.date >= startM && t.date <= endM);
    return {
      x: m,
      y: mtxs.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0),
      expense: mtxs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)
    };
  });

  // 2. Call Chart Engine
  const dataStr = JSON.stringify(data).replace(/"/g, '\\"');
  const chartPath = 'C:\\Agentic\\.gemini\\skills\\acex-chart-image\\scripts\\chart.mjs';
  const outName = `chart_${Date.now()}.png`;
  const outPath = `public/${outName}`;

  try {
    execSync(`node ${chartPath} --type line --data "${dataStr}" --title "2026 Financial Trend" --output ${outPath} --dark`);
    
    // Read and convert to base64 for direct UI embedding
    const imgData = fs.readFileSync(outPath);
    const base64 = `data:image/png;base64,${imgData.toString('base64')}`;

    console.log(JSON.stringify({
      url: base64,
      name: 'Financial Trend Graph',
      type: 'image'
    }));
  } catch (e) {
    console.error(e);
  }
}

generateChartChat().then(() => prisma.$disconnect());
