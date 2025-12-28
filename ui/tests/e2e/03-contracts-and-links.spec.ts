import { test, expect } from '@playwright/test';

// Test 3: Contract cards & external links (without wallet connection)

test.describe('Test 3: Contracts & Links', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show contract cards and buttons', async ({ page }) => {
    await expect(page.getByText('View Owner')).toBeVisible();
    await expect(page.getByText('Set Owner')).toBeVisible();
    await expect(page.getByRole('button', { name: /call get-owner/i })).toBeVisible();
    // Without wallet connection, show prompt instead of execute button
    await expect(page.getByText(/connect wallet to execute/i)).toBeVisible();
  });

  test('should have GitHub link present', async ({ page }) => {
    const githubLink = page.locator('a[href*="github.com"]');
    await expect(githubLink).toBeVisible();
  });
});
