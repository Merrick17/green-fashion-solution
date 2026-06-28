import { test, expect, Page } from '@playwright/test';

async function loginAsDesigner(page: Page) {
  await page.goto('/login');
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
  await emailInput.fill('designer@gfs.com');
  await passwordInput.fill('design123');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/designer\/dashboard/, { timeout: 10000 });
}

test.describe('Designer Portal', () => {
  test('designer dashboard loads', async ({ page }) => {
    await loginAsDesigner(page);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('designer can view fabrics', async ({ page }) => {
    await loginAsDesigner(page);
    await page.goto('/designer/assets/fabrics');
    await expect(page).toHaveURL(/\/designer\/assets\/fabrics/);
    await expect(page.getByRole('heading')).toBeVisible();
  });

  test('designer can view products', async ({ page }) => {
    await loginAsDesigner(page);
    await page.goto('/designer/assets/products');
    await expect(page).toHaveURL(/\/designer\/assets\/products/);
  });

  test('designer can view tasks', async ({ page }) => {
    await loginAsDesigner(page);
    await page.goto('/designer/tasks');
    await expect(page).toHaveURL(/\/designer\/tasks/);
  });

  test('designer can view collections', async ({ page }) => {
    await loginAsDesigner(page);
    await page.goto('/designer/collections');
    await expect(page).toHaveURL(/\/designer\/collections/);
  });

  test('designer cannot access admin routes', async ({ page }) => {
    await loginAsDesigner(page);
    await page.goto('/admin/dashboard');
    await expect(page).not.toHaveURL(/\/admin\//);
  });
});
