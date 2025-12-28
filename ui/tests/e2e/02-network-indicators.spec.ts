import { test, expect } from '@playwright/test';

// Verifies network badges/indicators without wallet connection
// Uses specific selectors to avoid strict-mode clashes

const footerNetwork = (page: any, text: string) => page.locator('footer').getByText(text);

test.describe('Test 2: Network Indicators', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show testnet indicators by default', async ({ page }) => {
    await expect(page.getByText('TESTNET MODE')).toBeVisible();
    await expect(footerNetwork(page, 'TESTNET Network')).toBeVisible();
    await expect(page.getByText('Real-time blockchain events from testnet network.')).toBeVisible();
    await expect(page.getByText('Monitor Hiro Chainhook for testnet network events.')).toBeVisible();
    await expect(page.getByText('testnet-playground-webhook')).toBeVisible();
  });

  test('should update indicators when switching to mainnet', async ({ page }) => {
    await page.getByRole('button', { name: 'Mainnet' }).click();

    await expect(page.getByText('MAINNET MODE')).toBeVisible();
    await expect(footerNetwork(page, 'MAINNET Network')).toBeVisible();
    await expect(page.getByText('Real-time blockchain events from mainnet network.')).toBeVisible();
    await expect(page.getByText('Monitor Hiro Chainhook for mainnet network events.')).toBeVisible();
    await expect(page.getByText('mainnet-playground-webhook')).toBeVisible();

    await page.getByRole('button', { name: 'Testnet' }).click();
    await expect(page.getByText('TESTNET MODE')).toBeVisible();
    await expect(footerNetwork(page, 'TESTNET Network')).toBeVisible();
  });
});
