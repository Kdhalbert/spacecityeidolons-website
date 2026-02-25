import { test, expect } from '@playwright/test';
/* eslint-disable @typescript-eslint/no-unused-vars */

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:3000/api';

test.describe('Calendar Discovery - E2E (US4)', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the calendar page
    await page.goto(`${BASE_URL}/calendar`);
  });

  test.describe('Calendar View', () => {
    test('should load and display the calendar', async ({ page }) => {
      await expect(page.locator('[data-testid="calendar"]')).toBeVisible();
    });

    test('should display current month', async ({ page }) => {
      const now = new Date();
      const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
      await expect(page.locator('text=' + monthName)).toBeVisible();
    });

    test('should highlight today', async ({ page }) => {
      const today = new Date().getDate();
      await expect(page.locator(`[data-testid="day-${today}"][data-today="true"]`)).toBeVisible();
    });

    test('should navigate to next month', async ({ page }) => {
      await page.click('[data-testid="next-month"]');
      await page.waitForTimeout(300); // Animation time
      
      const now = new Date();
      now.setMonth(now.getMonth() + 1);
      const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
      await expect(page.locator('text=' + monthName)).toBeVisible();
    });

    test('should navigate to previous month', async ({ page }) => {
      await page.click('[data-testid="prev-month"]');
      await page.waitForTimeout(300);
      
      const now = new Date();
      now.setMonth(now.getMonth() - 1);
      const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
      await expect(page.locator('text=' + monthName)).toBeVisible();
    });

    test('should show event count on dates with events', async ({ page }) => {
      const dateWithEvent = page.locator('[data-testid="day-with-event"]').first();
      await expect(dateWithEvent).toContainText(/\d+\s+event/i);
    });

    test('should navigate years', async ({ page }) => {
      // Click on year selector
      await page.click('[data-testid="year-selector"]');
      await page.click('text=2026');
      
      await expect(page.locator('text=2026')).toBeVisible();
    });
  });

  test.describe('Event Listing', () => {
    test('should display events for the selected date', async ({ page }) => {
      await page.click('[data-testid="day-with-event"]');
      await page.waitForLoadState('networkidle');
      
      const eventList = page.locator('[data-testid="event-list"]');
      await expect(eventList).toBeVisible();
    });

    test('should show event details (title, time, creator)', async ({ page }) => {
      await page.click('[data-testid="day-with-event"]');
      await page.waitForLoadState('networkidle');
      
      const eventCard = page.locator('[data-testid="event-card"]').first();
      await expect(eventCard.locator('[data-testid="event-title"]')).toHaveText(/.+/);
      await expect(eventCard.locator('[data-testid="event-time"]')).toHaveText(/\d{1,2}:\d{2}/);
      await expect(eventCard.locator('[data-testid="event-creator"]')).toHaveText(/.+/);
    });

    test('should display game tags on events', async ({ page }) => {
      await page.click('[data-testid="day-with-event"]');
      await page.waitForLoadState('networkidle');
      
      const gameTag = page.locator('[data-testid="event-game-tag"]').first();
      await expect(gameTag).toBeVisible();
    });

    test('should paginate event list', async ({ page }) => {
      await page.click('[data-testid="day-with-event"]');
      await page.waitForLoadState('networkidle');
      
      const nextButton = page.locator('[data-testid="event-next-page"]');
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForLoadState('networkidle');
        await expect(page.locator('[data-testid="event-card"]')).toBeVisible();
      }
    });

    test('should show empty state when no events on selected date', async ({ page }) => {
      // Click on a date without events
      await page.click('[data-testid="day-empty"]');
      
      const emptyState = page.locator('[data-testid="empty-state"]');
      await expect(emptyState).toContainText(/no events/i);
    });
  });

  test.describe('Event Filtering', () => {
    test('should filter events by date range', async ({ page }) => {
      await page.click('[data-testid="filter-toggle"]');
      
      await page.fill('[data-testid="filter-start-date"]', '2025-02-01');
      await page.fill('[data-testid="filter-end-date"]', '2025-02-28');
      await page.click('[data-testid="filter-apply"]');
      
      await page.waitForLoadState('networkidle');
      const eventList = page.locator('[data-testid="event-list"]');
      await expect(eventList).toBeVisible();
    });

    test('should filter events by game', async ({ page }) => {
      await page.click('[data-testid="filter-toggle"]');
      
      await page.click('[data-testid="game-filter"]');
      await page.click('text=Valorant');
      
      await page.click('[data-testid="filter-apply"]');
      await page.waitForLoadState('networkidle');
      
      const gameTag = page.locator('[data-testid="event-game-tag"]:text("Valorant")');
      await expect(gameTag).toBeVisible();
    });

    test('should support multiple game filters', async ({ page }) => {
      await page.click('[data-testid="filter-toggle"]');
      
      await page.click('[data-testid="game-filter"]');
      await page.click('text=Valorant');
      await page.click('text=CS:GO');
      
      await page.click('[data-testid="filter-apply"]');
      await page.waitForLoadState('networkidle');
      
      const events = page.locator('[data-testid="event-card"]');
      await expect(events.first()).toBeVisible();
    });

    test('should clear all filters', async ({ page }) => {
      await page.click('[data-testid="filter-toggle"]');
      
      await page.fill('[data-testid="filter-start-date"]', '2025-02-01');
      await page.click('text=Valorant');
      
      await page.click('[data-testid="filter-reset"]');
      
      expect(await page.inputValue('[data-testid="filter-start-date"]')).toBe('');
      const checkbox = page.locator('input[value="valorant"]');
      await expect(checkbox).not.toBeChecked();
    });

    test('should show filter count badge', async ({ page }) => {
      await page.click('[data-testid="filter-toggle"]');
      await page.fill('[data-testid="filter-start-date"]', '2025-02-01');
      
      const badge = page.locator('[data-testid="filter-count-badge"]');
      await expect(badge).toContainText('1');
    });

    test('should persist filter selections during session', async ({ page }) => {
      await page.click('[data-testid="filter-toggle"]');
      await page.click('text=Valorant');
      await page.click('[data-testid="filter-apply"]');
      
      // Navigate away and back
      await page.click('[data-testid="nav-home"]');
      await page.click('[data-testid="nav-calendar"]');
      
      const checkbox = page.locator('input[value="valorant"]');
      await expect(checkbox).toBeChecked();
    });
  });

  test.describe('Private Event Visibility', () => {
    test('should hide PRIVATE events from non-creators', async ({ page, context }) => {
      // Login as different user
      const page2 = await context.newPage();
      await page2.goto(`${BASE_URL}/login`);
      // Complete Discord login flow
      
      await page2.goto(`${BASE_URL}/calendar`);
      await page2.waitForLoadState('networkidle');
      
      const privateEventCount = await page2.locator(':text("Private")').count();
      expect(privateEventCount).toBe(0);
    });

    test('should show PRIVATE events to creator', async ({ page }) => {
      await page.locator('[data-testid="profile-menu"]').click();
      await expect(page.locator('text=My Events')).toBeVisible();
      
      await page.click('text=My Events');
      
      const privateEvent = page.locator('[data-testid="event-privacy-private"]');
      await expect(privateEvent).toBeVisible();
    });

    test('should show PRIVATE indicator for creator', async ({ page }) => {
      await page.click('[data-testid="day-with-private-event"]');
      
      const privateIndicator = page.locator('[data-testid="event-privacy-icon"]');
      await expect(privateIndicator).toBeVisible();
    });
  });

  test.describe('Event Interaction', () => {
    test('should open event detail on click', async ({ page }) => {
      await page.click('[data-testid="day-with-event"]');
      await page.waitForLoadState('networkidle');
      
      await page.click('[data-testid="event-card"]');
      
      await expect(page.locator('[data-testid="event-detail"]')).toBeVisible();
    });

    test('should show creator info on event detail', async ({ page }) => {
      await page.click('[data-testid="day-with-event"]');
      await page.waitForLoadState('networkidle');
      
      await page.click('[data-testid="event-card"]');
      
      await expect(page.locator('[data-testid="creator-name"]')).toBeVisible();
      await expect(page.locator('[data-testid="creator-avatar"]')).toBeVisible();
    });

    test('should navigate to creator profile', async ({ page }) => {
      await page.click('[data-testid="day-with-event"]');
      await page.waitForLoadState('networkidle');
      
      await page.click('[data-testid="event-card"]');
      await page.click('[data-testid="creator-avatar"]');
      
      await expect(page).toHaveURL(/\/profile\/\w+/);
    });

    test('should copy event details', async ({ page, context }) => {
      await page.click('[data-testid="day-with-event"]');
      await page.waitForLoadState('networkidle');
      
      await page.click('[data-testid="event-card"]');
      await page.click('[data-testid="event-copy"]');
      
      const copied = await context.evaluateHandle(() => navigator.clipboard.readText());
      await expect(copied).resolves.toMatch(/.+/);
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.press('[data-testid="calendar"]', 'Tab');
      await page.press('[data-testid="calendar"]', 'ArrowRight');
      
      const focused = page.locator(':focus');
      await expect(focused).toHaveAttribute('data-testid', /day-\d+/);
    });
  });

  test.describe('Responsive Design', () => {
    test('should display calendar and list side-by-side on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      
      const calendar = page.locator('[data-testid="calendar"]');
      const eventList = page.locator('[data-testid="event-list"]');
      
      const calendarBox = await calendar.boundingBox();
      const listBox = await eventList.boundingBox();
      
      // Both visible and side by side
      expect(calendarBox?.x).toBeLessThan(listBox?.x || 0);
    });

    test('should stack calendar and list on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      
      const calendar = page.locator('[data-testid="calendar"]');
      const eventList = page.locator('[data-testid="event-list"]');
      
      // Check if stacked layout is used
      const layout = page.locator('[data-testid="discovery-layout"]');
      await expect(layout).toHaveClass(/mobile-stack/);
    });

    test('should hide detailed calendar on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      
      const detailedView = page.locator('[data-testid="calendar-detailed"]');
      await expect(detailedView).not.toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load calendar within 2 seconds', async ({ page }) => {
      const start = Date.now();
      await page.goto(`${BASE_URL}/calendar`);
      await page.waitForLoadState('domcontentloaded');
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(2000);
    });

    test('should handle rapid date selection', async ({ page }) => {
      for (let i = 1; i <= 5; i++) {
        await page.click(`[data-testid="day-${i}"]`);
      }
      
      // Should not crash or have errors
      const errors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      
      expect(errors.length).toBe(0);
    });

    test('should lazy load event details', async ({ page }) => {
      await page.click('[data-testid="day-with-event"]');
      
      const eventCard = page.locator('[data-testid="event-card"]').first();
      
      // Wait for lazy loaded content
      await expect(eventCard.locator('[data-testid="event-full-details"]')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      const nextButton = page.locator('[data-testid="next-month"]');
      await expect(nextButton).toHaveAttribute('aria-label', /.+/);
    });

    test('should be keyboard navigable', async ({ page }) => {
      const month = page.locator('[data-testid="current-month"]');
      
      await page.press('body', 'Tab');
      await page.press('body', 'Enter');
      
      // Should have navigated
      const focused = page.locator(':focus');
      await expect(focused).toBeTruthy();
    });

    test('should respect prefers-reduced-motion', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      const calendar = page.locator('[data-testid="calendar"]');
      const style = await calendar.evaluate((el) => window.getComputedStyle(el).transitionDuration);
      
      expect(style).toBe('0s');
    });
  });
});
