import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });
  
  try {
    console.log('Navigating to page...');
    await page.goto('https://e-grid-capacity-marketplace.vercel.app', {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    
    // Wait for map to load
    await page.waitForTimeout(3000);
    
    console.log('Opening sidebar with matches...');
    // Click on Birmingham (132kV seller with good matches)
    const marker = await page.locator('.mapboxgl-marker').nth(2);
    await marker.click({ force: true });
    
    // Wait for sidebar to slide in and load matches
    await page.waitForTimeout(1500);
    
    // Scroll the sidebar to show matches section
    await page.locator('div.fixed.right-0').evaluate((el) => {
      el.scrollTop = 200;
    });
    
    await page.waitForTimeout(500);
    
    console.log('Taking screenshot with match suggestions...');
    await page.screenshot({ 
      path: 'screenshot-matches-detail.png',
      fullPage: false
    });
    
    console.log('Screenshot saved: screenshot-matches-detail.png');
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
})();
