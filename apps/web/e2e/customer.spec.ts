import { test, expect, Page } from '@playwright/test';

async function loginAsCustomer(page: Page) {
  await page.goto('/login');
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
  await emailInput.fill('brand@example.com');
  await passwordInput.fill('brand123');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/customer\/dashboard/, { timeout: 10000 });
}

test.describe('Customer Portal', () => {
  test('customer dashboard loads', async ({ page }) => {
    await loginAsCustomer(page);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('customer can navigate to projects', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/customer/projects');
    await expect(page).toHaveURL(/\/customer\/projects/);
  });

  test('customer can view proposals list', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/customer/proposals');
    await expect(page).toHaveURL(/\/customer\/proposals/);
    await expect(page.getByRole('heading')).toBeVisible();
  });

  test('customer can view inspiration', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/customer/inspiration');
    await expect(page).toHaveURL(/\/customer\/inspiration/);
  });

  test('customer cannot access admin routes', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/admin/dashboard');
    await expect(page).not.toHaveURL(/\/admin\//);
  });

  test('new project page loads', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/customer/projects/new');
    await expect(page).toHaveURL(/\/customer\/projects\/new/);
    await expect(page.getByRole('heading')).toBeVisible();
  });
});
