import { test, expect } from '@playwright/test';

test.describe('Test 1: Basic UI Components', () => {
  test('should show connect wallet button', async ({ page }) => {
    await page.goto('/');
    const connectButton = page.getByRole('button', { name: 'Connect Wallet' });
    await expect(connectButton).toBeVisible();
    await expect(connectButton).toBeEnabled();
  });

  test('should show network toggle buttons', async ({ page }) => {
    await page.goto('/');
    const testnetButton = page.getByRole('button', { name: 'Testnet' });
    const mainnetButton = page.getByRole('button', { name: 'Mainnet' });
    
    await expect(testnetButton).toBeVisible();
    await expect(mainnetButton).toBeVisible();
    await expect(testnetButton).toHaveClass(/bg-emerald-500/);
    await expect(mainnetButton).not.toHaveClass(/bg-amber-500/);
  });

  test('should toggle network selection', async ({ page }) => {
    await page.goto('/');
    const mainnetButton = page.getByRole('button', { name: 'Mainnet' });
    const testnetButton = page.getByRole('button', { name: 'Testnet' });
    
    // Switch to mainnet
    await mainnetButton.click();
    await expect(mainnetButton).toHaveClass(/bg-amber-500/);
    await expect(testnetButton).not.toHaveClass(/bg-emerald-500/);
    
    // Switch back to testnet
    await testnetButton.click();
    await expect(testnetButton).toHaveClass(/bg-emerald-500/);
    await expect(mainnetButton).not.toHaveClass(/bg-amber-500/);
  });
});
