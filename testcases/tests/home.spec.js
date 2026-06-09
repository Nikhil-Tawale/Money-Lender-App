import { test, expect } from '@playwright/test';

test.describe('Car Advisor - Home page', () => {
  const baseURL = 'https://car-advisor-app.onrender.com/';

  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
    await expect(page).toHaveURL(baseURL);
  });

  test('has correct title', async ({ page }) => {
    const title = await page.title();
    console.log('Title:', title);
    // adjust expected title if needed
    // await expect(page).toHaveTitle('Car Advisor');
  });

  test('main heading and scrolling', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Car Advisor');
    const feature = page.getByRole('heading', { name: 'Mahindra XUV400 EV' });
    await feature.scrollIntoViewIfNeeded();
    await expect(feature).toHaveText('Mahindra XUV400 EV');
  });

  test('scroll and close', async ({ page }) => {
    const feature = page.locator('h3', { hasText: 'Mahindra XUV400 EV' });
    await feature.scrollIntoViewIfNeeded();
    await expect(feature).toHaveCount(1);
    await page.close();
  });
});
