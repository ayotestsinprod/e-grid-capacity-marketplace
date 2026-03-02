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
    
    console.log('Clicking on a marker...');
    // Click on a marker to open the sidebar
    const marker = await page.locator('.mapboxgl-marker').first();
    await marker.click();
    
    // Wait for sidebar to slide in
    await page.waitForTimeout(1000);
    
    console.log('Taking screenshot...');
    await page.screenshot({ 
      path: '../filters-sidebar-demo.png',
      fullPage: false
    });
    
    console.log('Screenshot saved to filters-sidebar-demo.png');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
