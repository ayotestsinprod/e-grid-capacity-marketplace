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
    
    console.log('Filtering to show only sellers with 33kV...');
    // Click seller filter
    await page.click('button:has-text("Seller")');
    await page.waitForTimeout(500);
    
    // Click 33kV filter
    await page.click('button:has-text("33kV")');
    await page.waitForTimeout(1000);
    
    console.log('Clicking on a 33kV seller marker...');
    // Click on Edinburgh marker (seller, 33kV, should have matches)
    const markers = await page.locator('.mapboxgl-marker').all();
    if (markers.length > 0) {
      await markers[1].click({ force: true });
    }
    
    // Wait for sidebar to fully load
    await page.waitForTimeout(2000);
    
    console.log('Taking final screenshot...');
    await page.screenshot({ 
      path: 'screenshot-final.png',
      fullPage: false
    });
    
    console.log('Screenshot saved: screenshot-final.png');
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
})();
