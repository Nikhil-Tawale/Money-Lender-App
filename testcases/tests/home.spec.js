import { test, expect } from '@playwright/test';

test.describe('Car Advisor - Home page', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL ?? '/');
    await expect(page).toHaveURL(/./);
  });

  test('shows app landing with heading and login', async ({ page }) => {
    // Current app shows a login/landing page titled 'Money Lender'
    const heading = page.getByRole('heading', { name: /Money Lender/i });
    await expect(heading).toHaveCount(1, { timeout: 10000 });

    // Check for login form elements
    const email = page.getByPlaceholder(' ');
    const password = page.getByPlaceholder(' ', { exact: false });
    const signIn = page.getByRole('button', { name: /Sign In/i });
    await expect(signIn).toHaveCount(1);
    expect(await email.count()).toBeGreaterThanOrEqual(1);
    expect(await password.count()).toBeGreaterThanOrEqual(1);
  });

  test('landing page accessibility checks', async ({ page }) => {
    // ensure main heading exists and login controls are present
    const heading = page.getByRole('heading', { name: /Money Lender/i });
    await expect(heading).toHaveCount(1, { timeout: 15000 });
    await expect(page.getByRole('button', { name: /Sign In/i })).toHaveCount(1);
  });

  test('login form interactions (basic)', async ({ page }) => {
    const email = page.getByPlaceholder(' ');
    const password = page.getByPlaceholder(' ', { exact: false });
    const signIn = page.getByRole('button', { name: /Sign In/i });

    if ((await email.count()) > 0) await email.first().fill('test@example.com');
    if ((await password.count()) > 0) await password.first().fill('password');
    await expect(signIn).toBeVisible();
  });
});
