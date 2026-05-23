const { chromium } = require('playwright');

(async () => {
  console.log('⚡ GOD-NEXUS: Initializing SPA High-Speed UI Automation Test...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const baseUrl = 'http://localhost:3000';
  
  try {
    console.log(`[1] Navigating to Dashboard: ${baseUrl}`);
    let start = Date.now();
    await page.goto(baseUrl, { timeout: 120000 });
    await page.waitForLoadState('networkidle');
    console.log(`✅ Dashboard loaded in ${Date.now() - start}ms`);

    const routes = [
      { name: 'Documents', url: '/documents' },
      { name: 'Reports', url: '/reports' },
      { name: 'Projects', url: '/projects' },
      { name: 'Transactions', url: '/transactions' }
    ];

    console.log('\n🔥 [FIRST PASS] Warming up SWR Caches via SPA Click...');
    for (const route of routes) {
      start = Date.now();
      // Click sidebar link
      await page.click(`aside nav a[href="${route.url}"]`);
      await page.waitForLoadState('networkidle');
      console.log(`- ${route.name} initial load: ${Date.now() - start}ms`);
    }

    console.log('\n🚀 [SECOND PASS] Testing SWR Stale-While-Revalidate Speed...');
    let totalCachedTime = 0;
    for (const route of routes) {
      start = Date.now();
      await page.click(`aside nav a[href="${route.url}"]`);
      // Wait a tiny bit for React to render the cached data
      await page.waitForTimeout(100); 
      const timeTaken = Date.now() - start;
      totalCachedTime += timeTaken;
      console.log(`⚡ ${route.name} cached SPA navigation: ${timeTaken}ms`);
      
      if (timeTaken > 500) {
        console.warn(`⚠️ WARNING: ${route.name} is slower than expected!`);
      }
    }

    console.log(`\n🎯 AVERAGE CACHED LOAD TIME: ${totalCachedTime / routes.length}ms`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    console.log('\nTest completed. Closing browser in 3 seconds...');
    await new Promise(r => setTimeout(r, 3000));
    await browser.close();
  }
})();
