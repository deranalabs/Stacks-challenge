import { test, expect } from '@playwright/test';

// Test 6: Network mismatch warning (no wallet connected)
// Expectation: warning banner should NOT appear by default

test.describe('Test 6: Network mismatch', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should not show mismatch warning by default', async ({ page }) => {
    await expect(page.getByText(/Your wallet is on .* but you selected .*/i)).toHaveCount(0);
  });
});
