import { test, expect } from '@playwright/test';

// Test 4: Read-only contract call (no wallet, no mocks)

test.describe('Test 4: Read-only call', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show error when read-only call fails (mock 500)', async ({ page }) => {
    // Mock failure for read-only endpoint
    await page.route('**/contracts/call-read/**/get-owner', (route) => {
      route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
    });

    await page.getByRole('button', { name: /call get-owner/i }).click();
    await expect(page.getByText(/Unable to fetch owner/i)).toBeVisible();
  });
});
