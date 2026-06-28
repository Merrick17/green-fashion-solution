import { test, expect, Page } from '@playwright/test';

async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  const emailInput = page
    .locator('input[type="email"], input[name="email"], input[placeholder*="email" i]')
    .first();
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
  await emailInput.fill('admin@gfs.com');
  await passwordInput.fill('admin123');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 });
}

async function loginAsCustomer(page: Page) {
  await page.goto('/login');
  const emailInput = page
    .locator('input[type="email"], input[name="email"], input[placeholder*="email" i]')
    .first();
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
  await emailInput.fill('brand@example.com');
  await passwordInput.fill('brand123');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/customer\/dashboard/, { timeout: 10000 });
}

test.describe('Design regression smoke', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Fashion|Green/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('admin dashboard loads after login', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('customer inspiration page loads after login', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/customer/inspiration');
    await expect(page).toHaveURL(/\/customer\/inspiration/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
