import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Mobile viewport (iPhone 12 Pro)
  await page.setViewportSize({ width: 390, height: 844 });
  
  // Go to the deployed site
  await page.goto('https://e-grid-capacity-marketplace.vercel.app', {
    waitUntil: 'networkidle',
    timeout: 30000
  });
  
  // Wait a bit for map to load
  await page.waitForTimeout(3000);
  
  // Take screenshot
  await page.screenshot({ 
    path: 'screenshot-step5-mobile.png',
    fullPage: true
  });
  
  console.log('✅ Mobile screenshot saved as screenshot-step5-mobile.png');
  
  await browser.close();
})();
