const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`PAGE LOG ERROR: ${msg.text()}`);
    }
  });

  page.on('pageerror', exception => {
    console.log(`PAGE EXCEPTION: ${exception}`);
  });

  try {
    await page.goto('https://ezdocth.netlify.app/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    console.log("Navigation complete.");
  } catch (e) {
    console.log("Error navigating:", e);
  }

  await browser.close();
})();
