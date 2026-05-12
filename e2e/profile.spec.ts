import { test, expect } from '@playwright/test';

test.describe('Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profiles');
    await page.waitForLoadState('networkidle');
  });

  test('profiles page loads and renders heading content', async ({ page }) => {
    await expect(page.locator('h1').first()).toContainText(/profile|community/i);
  });

  test('profile search input is visible', async ({ page }) => {
    await expect(page.getByPlaceholder('Search by display name...')).toBeVisible();
  });

  test('guest can open a profile page when profile links are present', async ({ page }) => {
    const profileCards = page.locator('text=/joined/i');
    const cardCount = await profileCards.count();

    if (cardCount === 0) {
      test.skip(true, 'No profile fixtures available in current environment');
    }

    await profileCards.first().click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/profile\//);
  });

  test('profile edit flow requires authentication', async ({ page }) => {
    await page.goto('/profile/edit');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/login');
  });

  test('authenticated profile edit scenarios require backend auth fixtures', async () => {
    test.skip(true, 'Requires authenticated session fixture and seeded profile data');
  });
});
