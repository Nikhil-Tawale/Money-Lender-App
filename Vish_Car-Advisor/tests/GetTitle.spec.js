const {test, expect} =require('@playwright/test');

test('Get the Title of the page', async ({page}) => {
    await page.goto('https://car-advisor-app.onrender.com/');
    const title = await page.title();
    console.log(title); // assertion
   // await expect(page).toHaveTitle('Car Advisor');

});

