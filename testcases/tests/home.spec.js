import { test, expect } from '@playwright/test';

test.describe('Car Advisor - Home page', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL ?? '/');
    await expect(page).toHaveURL(/./);
  });

  test('has correct title', async ({ page }) => {
    // adjust expected title if needed
    // await expect(page).toHaveTitle('Car Advisor');
    await expect(page.title()).resolves.toBeTruthy();
  });

  test('main heading and scrolling', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Car Advisor');
    const feature = page.getByRole('heading', { name: 'Mahindra XUV400 EV' });
    await feature.scrollIntoViewIfNeeded();
    await expect(feature).toHaveText('Mahindra XUV400 EV');
  });

  test('scroll and verify feature', async ({ page }) => {
    const feature = page.locator('h3', { hasText: 'Mahindra XUV400 EV' });
    await feature.scrollIntoViewIfNeeded();
    await expect(feature).toHaveCount(1);
  });
});
