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
    
    console.log('Opening List Capacity modal...');
    // Click the "List Your Capacity" button
    await page.click('button:has-text("List Your Capacity")');
    
    // Wait for modal animation
    await page.waitForTimeout(800);
    
    console.log('Taking screenshot with modal...');
    await page.screenshot({ 
      path: 'screenshot-step4-modal.png',
      fullPage: false
    });
    
    console.log('Closing modal...');
    // Click the close button in the modal
    await page.locator('div[class*="fixed inset-0"] button').first().click();
    await page.waitForTimeout(800);
    
    console.log('Opening sidebar with matches...');
    // Click on a marker to open sidebar with match suggestions
    const marker = await page.locator('.mapboxgl-marker').nth(2);
    await marker.click({ force: true });
    
    // Wait for sidebar to slide in and load matches
    await page.waitForTimeout(1500);
    
    console.log('Taking screenshot with matches...');
    await page.screenshot({ 
      path: 'screenshot-step4-matches.png',
      fullPage: false
    });
    
    console.log('Screenshots saved!');
    console.log('- screenshot-step4-modal.png (List Capacity form)');
    console.log('- screenshot-step4-matches.png (Match suggestions panel)');
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
})();
