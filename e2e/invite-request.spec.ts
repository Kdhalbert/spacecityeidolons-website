import { test, expect } from '@playwright/test';

test.describe('Invite Request Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Discord Invite Request', () => {
    test('visitor can view and access Discord invite form', async ({ page }) => {
      await page.waitForLoadState('networkidle');

      // Look for Discord invite section or button
      const discordSection = page.locator('text=/.*discord.*/i').first();
      await expect(discordSection).toBeVisible();

      // Click to open Discord invite form (could be button, link, or section)
      const discordButton = page.locator('button:has-text("Discord"), a:has-text("Discord")').first();
      if (await discordButton.isVisible()) {
        await discordButton.click();
      }
    });

    test('visitor can submit Discord invite request with valid data', async ({ page }) => {
      await page.waitForLoadState('networkidle');

      // Navigate to Discord invite form
      const discordButton = page.locator('button:has-text("Discord"), a:has-text("Discord"), [data-testid="discord-invite"]').first();
      if (await discordButton.isVisible()) {
        await discordButton.click();
      }

      // Fill in the form
      const timestamp = Date.now();
      await page.fill('input[type="email"], input[name="email"]', `e2e-discord-${timestamp}@example.com`);
      await page.fill('input[name="name"], input[placeholder*="name" i]', 'E2E Discord User');
      
      // Optional message field
      const messageField = page.locator('textarea, input[name="message"]');
      if (await messageField.isVisible()) {
        await messageField.fill('I would love to join the community!');
      }

      // Submit the form
      await page.click('button[type="submit"], button:has-text("Submit"), button:has-text("Request")');

      // Wait for success message
      await expect(page.locator('text=/success|thank you|received/i')).toBeVisible({ timeout: 5000 });

      // Verify form is cleared or hidden after submission
      const emailInput = page.locator('input[type="email"]');
      if (await emailInput.isVisible()) {
        await expect(emailInput).toHaveValue('');
      }
    });

    test('shows validation error for invalid email', async ({ page }) => {
      await page.waitForLoadState('networkidle');

      // Navigate to form
      const discordButton = page.locator('button:has-text("Discord"), a:has-text("Discord"), [data-testid="discord-invite"]').first();
      if (await discordButton.isVisible()) {
        await discordButton.click();
      }

      // Fill with invalid email
      await page.fill('input[type="email"], input[name="email"]', 'not-an-email');
      await page.fill('input[name="name"], input[placeholder*="name" i]', 'Test User');
      await page.click('button[type="submit"], button:has-text("Submit")');

      // Should show error
      await expect(page.locator('text=/invalid.*email|email.*invalid/i')).toBeVisible({ timeout: 3000 });
    });

    test('shows validation error for empty name', async ({ page }) => {
      await page.waitForLoadState('networkidle');

      const discordButton = page.locator('button:has-text("Discord"), a:has-text("Discord")').first();
      if (await discordButton.isVisible()) {
        await discordButton.click();
      }

      // Fill email but leave name empty
      await page.fill('input[type="email"]', 'test@example.com');
      await page.click('button[type="submit"]');

      // Should show error
      await expect(page.locator('text=/name.*required|required.*name/i')).toBeVisible({ timeout: 3000 });
    });

    test('shows error for duplicate email submission', async ({ page }) => {
      await page.waitForLoadState('networkidle');

      const discordButton = page.locator('button:has-text("Discord"), a:has-text("Discord")').first();
      if (await discordButton.isVisible()) {
        await discordButton.click();
      }

      const email = `duplicate-${Date.now()}@example.com`;

      // First submission
      await page.fill('input[type="email"]', email);
      await page.fill('input[name="name"]', 'First User');
      await page.click('button[type="submit"]');
      await expect(page.locator('text=/success|received/i')).toBeVisible({ timeout: 5000 });

      // Try to submit again with same email
      await page.fill('input[type="email"]', email);
      await page.fill('input[name="name"]', 'Second User');
      await page.click('button[type="submit"]');

      // Should show duplicate error
      await expect(page.locator('text=/already.*exist|duplicate/i')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Matrix Invite Request', () => {
    test('visitor can view and access Matrix invite form', async ({ page }) => {
      await page.waitForLoadState('networkidle');

      // Look for Matrix/Element invite section
      const matrixSection = page.locator('text=/.*matrix.*|.*element.*/i').first();
      await expect(matrixSection).toBeVisible();

      // Click to open Matrix invite form
      const matrixButton = page.locator('button:has-text("Matrix"), button:has-text("Element"), a:has-text("Matrix"), a:has-text("Element")').first();
      if (await matrixButton.isVisible()) {
        await matrixButton.click();
      }
    });

    test('visitor can submit Matrix invite request with valid data', async ({ page }) => {
      await page.waitForLoadState('networkidle');

      // Navigate to Matrix invite form
      const matrixButton = page.locator('button:has-text("Matrix"), button:has-text("Element"), [data-testid="matrix-invite"]').first();
      if (await matrixButton.isVisible()) {
        await matrixButton.click();
      }

      // Fill in the form
      const timestamp = Date.now();
      await page.fill('input[type="email"]', `e2e-matrix-${timestamp}@example.com`);
      await page.fill('input[name="name"]', 'E2E Matrix User');

      // Submit the form
      await page.click('button[type="submit"], button:has-text("Submit"), button:has-text("Request")');

      // Wait for success message
      await expect(page.locator('text=/success|thank you|received/i')).toBeVisible({ timeout: 5000 });
    });

    test('allows same email for Matrix if already used for Discord', async ({ page }) => {
      const email = `multi-platform-${Date.now()}@example.com`;

      // Submit Discord request first
      await page.goto('/');
      const discordButton = page.locator('button:has-text("Discord"), [data-testid="discord-invite"]').first();
      if (await discordButton.isVisible()) {
        await discordButton.click();
      }
      await page.fill('input[type="email"]', email);
      await page.fill('input[name="name"]', 'Multi Platform User');
      await page.click('button[type="submit"]');
      await expect(page.locator('text=/success/i')).toBeVisible({ timeout: 5000 });

      // Now submit Matrix request with same email
      await page.goto('/');
      const matrixButton = page.locator('button:has-text("Matrix"), button:has-text("Element"), [data-testid="matrix-invite"]').first();
      if (await matrixButton.isVisible()) {
        await matrixButton.click();
      }
      await page.fill('input[type="email"]', email);
      await page.fill('input[name="name"]', 'Multi Platform User');
      await page.click('button[type="submit"]');

      // Should succeed
      await expect(page.locator('text=/success/i')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('User Experience', () => {
    test('landing page loads within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      // Should load in under 3 seconds (per success criteria SC-016)
      expect(loadTime).toBeLessThan(3000);
    });

    test('invite request form is keyboard accessible', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Tab through the page to reach Discord invite
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to activate Discord invite with Enter
      await page.keyboard.press('Enter');

      // Should be able to tab through form fields
      await page.keyboard.press('Tab');
      const emailField = await page.locator(':focus');
      await expect(emailField).toHaveAttribute('type', 'email');

      await page.keyboard.type('test@example.com');
      await page.keyboard.press('Tab');
      await page.keyboard.type('Test User');
      await page.keyboard.press('Tab');
      
      // Should be able to submit with Enter on submit button
      await page.keyboard.press('Enter');
    });

    test('shows loading state during form submission', async ({ page }) => {
      await page.goto('/');
      
      const discordButton = page.locator('button:has-text("Discord")').first();
      if (await discordButton.isVisible()) {
        await discordButton.click();
      }

      await page.fill('input[type="email"]', 'loading-test@example.com');
      await page.fill('input[name="name"]', 'Loading Test');
      
      // Click submit and immediately check for loading state
      await page.click('button[type="submit"]');
      
      // Should show loading indicator
      const loadingIndicator = page.locator('text=/loading|submitting|sending/i, [role="status"]');
      await expect(loadingIndicator).toBeVisible({ timeout: 1000 });
    });

    test('displays community information on landing page', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Should see community name
      await expect(page.locator('text=/space city eidolons/i')).toBeVisible();

      // Should see some descriptive content within 30 seconds of viewing (SC-001)
      const descriptionText = page.locator('text=/gaming|community|play/i').first();
      await expect(descriptionText).toBeVisible({ timeout: 30000 });
    });

    test('landing page is accessible to unauthenticated visitors', async ({ page, context }) => {
      // Clear any existing cookies/session
      await context.clearCookies();

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Should be able to see invite request forms without logging in
      const discordInvite = page.locator('text=/discord/i').first();
      await expect(discordInvite).toBeVisible();

      const matrixInvite = page.locator('text=/matrix|element/i').first();
      await expect(matrixInvite).toBeVisible();
    });
  });

  test.describe('Error Handling and Recovery', () => {
    test('shows helpful error message on network failure', async ({ page, context }) => {
      // Simulate network failure
      await context.route('**/api/invites', route => route.abort());

      await page.goto('/');
      const discordButton = page.locator('button:has-text("Discord")').first();
      if (await discordButton.isVisible()) {
        await discordButton.click();
      }

      await page.fill('input[type="email"]', 'network-error@example.com');
      await page.fill('input[name="name"]', 'Network Error Test');
      await page.click('button[type="submit"]');

      // Should show network error message
      await expect(page.locator('text=/error|failed|problem/i')).toBeVisible({ timeout: 5000 });
    });

    test('allows user to retry after error', async ({ page, context }) => {
      let attemptCount = 0;
      
      await context.route('**/api/invites', route => {
        attemptCount++;
        if (attemptCount === 1) {
          // First attempt fails
          route.abort();
        } else {
          // Second attempt succeeds
          route.fulfill({
            status: 201,
            body: JSON.stringify({
              id: '123',
              email: 'retry@example.com',
              name: 'Retry Test',
              platform: 'DISCORD',
              status: 'PENDING',
            }),
          });
        }
      });

      await page.goto('/');
      const discordButton = page.locator('button:has-text("Discord")').first();
      if (await discordButton.isVisible()) {
        await discordButton.click();
      }

      await page.fill('input[type="email"]', 'retry@example.com');
      await page.fill('input[name="name"]', 'Retry Test');
      
      // First attempt
      await page.click('button[type="submit"]');
      await expect(page.locator('text=/error|failed/i')).toBeVisible({ timeout: 5000 });

      // Retry
      await page.click('button[type="submit"], button:has-text("Try Again"), button:has-text("Retry")');
      await expect(page.locator('text=/success/i')).toBeVisible({ timeout: 5000 });
    });
  });
});
