const { chromium } = require('playwright');

(async () => {
    console.log('🚀 Starting Enterprise Reconnaissance...');
    const browser = await chromium.launch({ headless: true }); // Headless for faster recon, but I will save screenshots
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });

    try {
        // Login
        console.log('[RECON] Logging in...');
        await page.goto('http://localhost:3000/login');
        await page.waitForTimeout(5000); // Wait for Next.js compilation and hydration
        await page.fill('input[name="email"]', 'owner@unizin.co.th');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard');

        // Check Reports
        console.log('[RECON] Inspecting /reports...');
        await page.goto('http://localhost:3000/reports');
        await page.waitForLoadState('load');
        await page.waitForTimeout(3000); // Give time for charts to animate/load
        await page.screenshot({ path: 'recon-reports.png', fullPage: true });
        
        const reportsHtml = await page.content();
        console.log(`- Reports Page HTML Length: ${reportsHtml.length}`);
        
        // Check Settings
        console.log('[RECON] Inspecting /settings...');
        await page.goto('http://localhost:3000/settings');
        await page.waitForLoadState('load');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'recon-settings.png', fullPage: true });

        // Trigger Invite Member Dialog
        console.log('[RECON] Navigating to members tab and triggering invite dialog...');
        await page.click('button:has-text("สมาชิกและสิทธิ์")');
        await page.waitForTimeout(500);
        const uploadBtn = page.locator('button:has-text("เชิญสมาชิกใหม่")').first();
        if (await uploadBtn.isVisible()) {
            await uploadBtn.click();
            await page.waitForTimeout(1000);
            await page.screenshot({ path: 'recon-settings-popup.png' });
            
            // Analyze popup transparency/styles
            const popupStyles = await page.evaluate(() => {
                const modal = document.querySelector('[role="dialog"], .modal, .fixed');
                if (!modal) return 'Modal not found';
                const style = window.getComputedStyle(modal);
                return {
                    backgroundColor: style.backgroundColor,
                    opacity: style.opacity,
                    backdropFilter: style.backdropFilter,
                    zIndex: style.zIndex
                };
            });
            console.log('- Popup Styles:', JSON.stringify(popupStyles, null, 2));
        } else {
            console.log('- Invite button not found!');
        }

    } catch (error) {
        console.error('❌ Recon Failed:', error);
    } finally {
        await browser.close();
        console.log('🏁 Recon Finished.');
    }
})();
