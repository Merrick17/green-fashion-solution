import { test, expect, Page } from '@playwright/test';

async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
  await emailInput.fill('admin@gfs.com');
  await passwordInput.fill('admin123');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 });
}

test.describe('Admin Portal', () => {
  test('admin dashboard loads with heading', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('admin can navigate to proposals', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/proposals');
    await expect(page).toHaveURL(/\/admin\/proposals/);
    await expect(page.getByRole('heading')).toBeVisible();
  });

  test('admin proposal builder page loads', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/proposals/new');
    await expect(page).toHaveURL(/\/admin\/proposals\/new/);
    await expect(page.getByRole('heading')).toBeVisible();
  });

  test('admin can view projects list', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/projects');
    await expect(page).toHaveURL(/\/admin\/projects/);
  });

  test('admin can view tasks', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/tasks');
    await expect(page).toHaveURL(/\/admin\/tasks/);
  });

  test('admin can view users', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/users');
    await expect(page).toHaveURL(/\/admin\/users/);
  });

  test('admin cannot access customer routes', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/customer/dashboard');
    // Should be redirected away from customer
    await expect(page).not.toHaveURL(/\/customer\//);
  });
});
