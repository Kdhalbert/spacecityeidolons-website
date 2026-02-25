import { test, expect } from '@playwright/test';
/* eslint-disable @typescript-eslint/no-unused-vars */

test.describe('Discord Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('login page loads with Discord OAuth button', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Check for Discord login button
    const discordButton = page.locator('a[href*="discord"]');
    await expect(discordButton).toBeVisible();
    
    // Check button text (use first() to avoid strict mode violation)
    await expect(page.locator('text=/login.*discord/i').first()).toBeVisible();

    // Verify page title/heading
    await expect(page.locator('h1').first()).toContainText(/sign in|login/i);
  });

  test('Discord login button has correct OAuth endpoint', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Check that Discord button links to the OAuth endpoint
    const discordButton = page.locator('a[href*="discord"]');
    const href = await discordButton.getAttribute('href');
    
    expect(href).toContain('/api/auth/discord');
  });

  test('OAuth callback page handles successful authentication', async ({ page, context }) => {
    // Skip this test - requires backend integration
    test.skip(true, 'Requires backend mock server for OAuth callback');
    
    // This test would need a proper backend mock or test environment
    // to simulate the full OAuth flow
  });

  test('OAuth callback handles missing code error', async ({ page }) => {
    await page.goto('/auth/callback');
    await page.waitForLoadState('networkidle');

    // Should show error message (use h3 to be specific)
    await expect(page.locator('h3').filter({ hasText: /authentication failed/i })).toBeVisible();
    await expect(page.locator('text=/missing.*code|code.*missing/i')).toBeVisible();

    // Should have retry button (use getByRole for specificity)
    await expect(page.getByRole('link', { name: /try again/i })).toBeVisible();

    // Should have home link (use exact name to avoid matching header)
    await expect(page.getByRole('link', { name: 'Go Home', exact: true })).toBeVisible();
  });

  test('OAuth callback handles access denied error', async ({ page }) => {
    await page.goto('/auth/callback?error=access_denied');
    await page.waitForLoadState('networkidle');

    // Should show user-friendly error message
    await expect(page.locator('text=/cancelled|denied/i')).toBeVisible();

    // Should have options to retry or go home
    const retryLink = page.getByRole('link', { name: /try again/i });
    await expect(retryLink).toBeVisible();
  });

  test('protected routes redirect to login when not authenticated', async ({ page, context }) => {
    // Clear any existing authentication
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());

    // Try to access a protected route (profile page)
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Should redirect to login page
    await expect(page).toHaveURL('/login');
  });

  test('authenticated users can access protected routes', async ({ page, context }) => {
    // Skip this test - requires full auth flow integration
    test.skip(true, 'Requires backend integration and proper auth token handling');
    
    // This test would need proper backend API mocking or test environment
  });

  test('header shows login button when not authenticated', async ({ page, context }) => {
    // Clear authentication
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Header should show login button
    const loginButton = page.locator('header a[href="/login"], header button:has-text("Login")');
    await expect(loginButton).toBeVisible();
  });

  test('header shows user info and logout when authenticated', async ({ page, context }) => {
    // Skip - requires backend integration
    test.skip(true, 'Requires backend integration for auth context');
  });

  test('logout clears authentication and redirects', async ({ page, context }) => {
    // Skip - requires backend integration
    test.skip(true, 'Requires backend integration for auth flow');
  });

  test('displays Discord avatar when user is authenticated', async ({ page }) => {
    // Skip - requires backend integration
    test.skip(true, 'Requires backend integration for avatar display');
  });

  test('handles expired token with automatic refresh', async ({ page }) => {
    // Skip - requires backend integration and complex API mocking
    test.skip(true, 'Requires backend integration for token refresh flow');
  });
});
