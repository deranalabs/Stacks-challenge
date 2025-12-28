import { test, expect } from '@playwright/test';

// Test 5: Page sections (hero, monitoring blocks)

test.describe('Test 5: Page sections', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show hero headline and description', async ({ page }) => {
    await expect(page.getByText('Build faster on Stacks.')).toBeVisible();
    await expect(page.getByText(/A minimalist workspace to explore Stacks\.js/)).toBeVisible();
  });

  test('should show monitoring sections', async ({ page }) => {
    await expect(page.getByText('Event Stream')).toBeVisible();
    await expect(page.getByText('Network Status')).toBeVisible();
    await expect(page.getByText('Webhook Status')).toBeVisible();
  });
});
