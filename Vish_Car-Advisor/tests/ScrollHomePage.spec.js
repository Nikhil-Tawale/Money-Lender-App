import {test, expect} from '@playwright/test';

test('Scroll the Home page', async ({page}) => {
    await page.goto('https://car-advisor-app.onrender.com/');
    await expect(page).toHaveURL('https://car-advisor-app.onrender.com/');
    //await expect(page.locator('h1')).toHaveText('Car Advisor');
   // await page.evaluate(() => window.scrollTo(0, 1000));

    await page.locator('h3').scrollIntoViewIfNeeded('Mahindra XUV400 EV ');
    // await expect(page.locator('h3')).toHaveText('Mahindra XUV400 EV');
    //await expect(page.locator('h3')).toHaveText('Mahindra XUV400 EV');
    await page.close();

});