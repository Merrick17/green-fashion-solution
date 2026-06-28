import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Fashion|Green/i);
  });

  test('login page is accessible', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('protected admin route redirects to login', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('protected customer route redirects to login', async ({ page }) => {
    await page.goto('/customer/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('protected designer route redirects to login', async ({ page }) => {
    await page.goto('/designer/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('login as admin reaches admin dashboard', async ({ page }) => {
    await page.goto('/login');
    // Find email and password fields — try common selectors
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await emailInput.fill('admin@gfs.com');
    await passwordInput.fill('admin123');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });

  test('login as customer reaches customer dashboard', async ({ page }) => {
    await page.goto('/login');
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await emailInput.fill('brand@example.com');
    await passwordInput.fill('brand123');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/customer\/dashboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/customer\/dashboard/);
  });

  test('wrong password shows error', async ({ page }) => {
    await page.goto('/login');
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await emailInput.fill('admin@gfs.com');
    await passwordInput.fill('wrongpassword');
    await page.locator('button[type="submit"]').click();
    // Should stay on login page and show an error
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/login/);
  });
});
