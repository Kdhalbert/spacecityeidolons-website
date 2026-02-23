import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that page has content
    expect(await page.title()).toBeTruthy();
  });

  test('has no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out known/acceptable errors (like missing favicon)
    const criticalErrors = errors.filter(err => 
      !err.includes('favicon.ico') && 
      !err.includes('404')
    );

    expect(criticalErrors).toHaveLength(0);
  });
});
