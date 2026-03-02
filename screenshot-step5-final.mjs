import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  // Go to the deployed site
  await page.goto('https://e-grid-capacity-marketplace.vercel.app', {
    waitUntil: 'networkidle',
    timeout: 30000
  });
  
  // Wait a bit for map to load
  await page.waitForTimeout(3000);
  
  // Take screenshot
  await page.screenshot({ 
    path: 'screenshot-step5-final.png',
    fullPage: false
  });
  
  console.log('✅ Screenshot saved as screenshot-step5-final.png');
  
  await browser.close();
})();
