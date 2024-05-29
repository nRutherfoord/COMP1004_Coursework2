import exp from 'constants';

// @ts-check
const { test, expect} = require('@playwright/test');

// change this to the URL of your website, could be local or GitHub pages
const websiteURL = 'http://127.0.0.1:5500/index-people-search.html';

// Go to the website home page before each test.
test.beforeEach(async ({ page }) => {
   await page.goto(websiteURL);
});

// # html tests

// page links
test('homepage heading', async ({ page }) => {

   // Expect a heading 'People Search"
   await expect(page.getByRole('heading', { name: 'People Search' })).toBeVisible();

});

test('link - vehicle search', async ({ page }) => {

   // Click the 'vehicle search' link.
   await page.getByRole('link', { name: 'Vehicle search' }).click();

   // Expects page to have a heading 'Vehicle search'.
   await expect(page.getByRole('heading', { name: 'Vehicle Search' })).toBeVisible();
});

test('link - add a vehicle', async ({ page }) => {

   // Click the 'vehicle search' link.
   await page.getByRole('link', { name: 'Add a vehicle' }).click();

   // Expects page to have a heading 'Vehicle search'.
   await expect(page.getByRole('heading', { name: 'Add a Vehicle' })).toBeVisible();
});


// head
test('should set the language to English', async ({ page }) => {
   const htmlElement = await page.locator('html');
   await expect(htmlElement).toHaveAttribute('lang','en');
});

// semantic structure elements
test('there is a <header> element', async ({ page }) => {
   const headerNum = await page.locator('header').count()
   expect(headerNum).toBeGreaterThan(0)
})

// ul for navigation link
test('there is a <ul> inside <header> for navigation links', async ({ page }) => {

   const ulNum = await page.locator('header').locator('ul').count()
   expect(ulNum).toBeGreaterThan(0)

})

test('there are three navigation links (<li>)', async ({ page }) => {
   const liNum = await page.locator('header').locator('ul').locator('li').count()
   // console.log(`liNum: ${liNum}`)
   expect(liNum).toBeGreaterThan(2)
})

// there is an image or video in side bar
test('html - image or video', async ({ page }) => {
   const imageNum = await page.locator('aside').locator('img').count()
   const videoNum = await page.locator('aside').locator('video').count()
   expect(imageNum + videoNum).toBeGreaterThan(0)
})


// # CSS tests

// all pages use the same css

test('same external css for all html pages', async ({ page }) => {
   
   const cssFile = await page.locator('link').getAttribute('href')

   await page.getByRole('link', { name: 'Vehicle search' }).click();
   await expect(page.locator('link')).toHaveAttribute('href', cssFile);

   await page.getByRole('link', { name: 'Add a vehicle' }).click();
   await expect(page.locator('link')).toHaveAttribute('href', cssFile);
})

// css flex for navigation links

test('use css flex to place navigation links horizontally', async ({ page }) => {

   await expect(page.locator('header').locator('ul')).toHaveCSS('display', 'flex')

   await expect(page.getByRole('link', { name: 'Vehicle search' })).toHaveCSS('flex', '0 1 auto')

})

// border margin padding

   test('header should have padding 10px, margin 10px, and border 1px solid black', async ({ page }) => {
   
   const space = '10px'
   const border = '1px solid rgb(0, 0, 0)'

   await expect(page.locator('header')).toHaveCSS('padding', space)
   await expect(page.locator('header')).toHaveCSS('margin', space)
   await expect(page.locator('header')).toHaveCSS('border', border)
})

// CSS grid

test ('CSS grid is used to layout the page components', async({page}) => {
   await expect(page.locator('.container')).toHaveCSS('display','grid')
})

// # JavaScript Tests

// people search
test ('search "rachel" should return two records', async ({page}) => {
   await page.locator('#name').fill('rachel')
   await page.getByRole('button', { name: 'Submit' }).click();
   await expect(page.locator('#results')).toContainText('SG345PQ')
   await expect(page.locator('#results')).toContainText('JK239GB')
   await expect(page.locator('#results').locator('div')).toHaveCount(2)
   await expect(page.locator('#message')).toContainText('Search successful')
})

// people search with invalid driver name

test('search with non-existent driver name', async ({page}) => {
   await page.locator('#name').fill('Nicholas')
   await page.getByRole('button', { name: 'Submit' }).click();
   await expect(page.locator('#message')).toContainText('No result found')
   await expect(page.locator('#results').locator('div')).toHaveCount(0)
})

// people search with both fields empty 

test('search with both people search fields empty', async ({page}) => {
   await page.getByRole('button', { name: 'Submit' }).click();
   await expect(page.locator('#message')).toContainText('Error')
   await expect(page.locator('#results').locator('div')).toHaveCount(0)

})

// people search with both fields populated 

test('search with both people search fields populated with valid data', async ({page}) => {
   await page.locator('#name').fill('Rachel Johnson')
   await page.locator('#license').fill('SG345PQ')
   await page.getByRole('button', { name: 'Submit' }).click();
   await expect(page.locator('#message')).toContainText('Error')
   await expect(page.locator('#results').locator('div')).toHaveCount(0)

})

// vehicle search
test('search "KWK24JI" should return tesla but no owner', async ({page}) => {
   await page.getByRole('link', { name: 'Vehicle search' }).click();
   await page.locator('#rego').fill('KWK24JI')
   await page.getByRole('button', { name: 'Submit' }).click();
   await expect(page.locator('#results')).toContainText('Tesla')
   await expect(page.locator('#results').locator('div')).toHaveCount(1)
   await expect(page.locator('#message')).toContainText('Search successful')
})
//vehicle search with empty registration input
test('search with vehicle search field empty', async ({page}) => {
   await page.getByRole('link', { name: 'Vehicle search' }).click();
   await page.getByRole('button', { name: 'Submit' }).click();
   await expect(page.locator('#message')).toContainText('Error')
   await expect(page.locator('#results').locator('div')).toHaveCount(0)

})
// vehicle search for invalid vehicle
test('search "RT123NR" should return no result found', async ({page}) => {
   await page.getByRole('link', { name: 'Vehicle search' }).click();
   await page.locator('#rego').fill('RT123NR')
   await page.getByRole('button', { name: 'Submit' }).click();
   await expect(page.locator('#results').locator('div')).toHaveCount(0)
   await expect(page.locator('#message')).toContainText('No result found')
})


// add a vehicle (missing owner)
test('add a vehicle (no owner)', async ({page}) => {
   await page.getByRole('link', { name: 'Add a vehicle' }).click();
   await page.locator('#rego').fill('LKJ23UO')
   await page.locator('#make').fill('Porsche')
   await page.locator('#model').fill('Taycan')
   await page.locator('#colour').fill('white')
   await page.locator('#owner').fill('Kai')
   await page.getByRole('button', { name: 'Add vehicle' }).click();

   // add a new person
   await page.locator('#personid').fill('6')
   await page.locator('#name').fill('Kai')
   await page.locator('#address').fill('Edinburgh')
   await page.locator('#dob').fill('1990-01-01')
   await page.locator('#license').fill('SD876ES')
   await page.locator('#expire').fill('2030-01-01')
   await page.getByRole('button', { name: 'Add owner' }).click();
   
   await expect(page.locator('#message')).toContainText('Vehicle added successfully')

   await page.getByRole('link', { name: 'People search' }).click();
   await page.locator('#name').fill('Kai')
   await page.getByRole('button', { name: 'Submit' }).click();
   await expect(page.locator('#results')).toContainText('SD876ES')
   await expect(page.locator('#results').locator('div')).toHaveCount(1)
})


// add a vehicle with ( with an existing owner)

test('add a vehicle (existing owner)', async ({page})=> {
   await page.getByRole('link', { name: 'Add a vehicle' }).click();
   await page.locator('#rego').fill('NR218SA')
   await page.locator('#make').fill('BMW')
   await page.locator('#model').fill('M4')
   await page.locator('#colour').fill('Grey')
   await page.locator('#owner').fill('Oliver Reps')
   await page.getByRole('button', { name: 'Add vehicle' }).click();
   await expect(page.locator('#message')).toContainText('Vehicle added successfully')


   await page.getByRole('link', { name: 'Vehicle Search' }).click();
   await page.locator('#rego').fill('NR218SA')
   await page.getByRole('button', { name: 'Submit' }).click();
   await expect(page.locator('#results')).toContainText('NR218SA')
   await expect(page.locator('#results').locator('div')).toHaveCount(1)
   

})


// add a vehicle with an existing registration
test('add a vehicle with already existing registration ("KWK24JI")', async ({page}) => {
   await page.getByRole('link', { name: 'Add a vehicle' }).click();
   await page.locator('#rego').fill('KWK24JI')
   await page.locator('#make').fill('Ford')
   await page.locator('#model').fill('F150')
   await page.locator('#colour').fill('Black')
   await page.locator('#owner').fill('Oliver Reps')
   await page.getByRole('button', { name: 'Add vehicle' }).click();
   await expect(page.locator('#message')).toContainText('Error. Vehicle registration already exists')

})

// add a vehicle with a missing field
test('add a vehicle with a missing field', async ({page}) => {
   await page.getByRole('link', { name: 'Add a vehicle' }).click();
   await page.locator('#rego').fill('JAG303SG')
   await page.locator('#make').fill('')
   await page.locator('#model').fill('F150')
   await page.locator('#colour').fill('Black')
   await page.locator('#owner').fill('James Mark')
   await page.getByRole('button', { name: 'Add vehicle' }).click();


   await expect(page.locator('#message')).toContainText('Error. At least one field is empty.')

})

// add a person with an existing license number
test('add a person with already existing license ("DL890GB")', async ({page}) => {
   await page.getByRole('link', { name: 'Add a vehicle' }).click();
   await page.locator('#rego').fill('JAG303SG')
   await page.locator('#make').fill('Ford')
   await page.locator('#model').fill('F150')
   await page.locator('#colour').fill('Black')
   await page.locator('#owner').fill('James Mark')
   await page.getByRole('button', { name: 'Add vehicle' }).click();


   // add a new person
   await page.locator('#personid').fill('7')
   await page.locator('#name').fill('James Mark')
   await page.locator('#address').fill('Edinburgh')
   await page.locator('#dob').fill('1990-01-01')
   await page.locator('#license').fill('DL890GB')
   await page.locator('#expire').fill('2030-01-01')
   await page.getByRole('button', { name: 'Add owner' }).click();

   await expect(page.locator('#message')).toContainText('Error. License number already exists')

}) 

// add a person with an existing PersonID
test('add a person with an existing PersonID (1)', async ({page}) => {
   await page.getByRole('link', { name: 'Add a vehicle' }).click();
   await page.locator('#rego').fill('JAG303SG')
   await page.locator('#make').fill('Ford')
   await page.locator('#model').fill('F150')
   await page.locator('#colour').fill('Black')
   await page.locator('#owner').fill('James Mark')
   await page.getByRole('button', { name: 'Add vehicle' }).click();


   // add a new person
   await page.locator('#personid').fill('1')
   await page.locator('#name').fill('James Mark')
   await page.locator('#address').fill('Edinburgh')
   await page.locator('#dob').fill('1990-01-01')
   await page.locator('#license').fill('DV98RFA')
   await page.locator('#expire').fill('2030-01-01')
   await page.getByRole('button', { name: 'Add owner' }).click();

   await expect(page.locator('#message')).toContainText('Error. Person ID already exists')

}) 


// add a person with a missing field
test('add a person with a missing field', async ({page}) => {
   await page.getByRole('link', { name: 'Add a vehicle' }).click();
   await page.locator('#rego').fill('JAG303SG')
   await page.locator('#make').fill('Ford')
   await page.locator('#model').fill('F150')
   await page.locator('#colour').fill('Black')
   await page.locator('#owner').fill('James Mark')
   await page.getByRole('button', { name: 'Add vehicle' }).click();


   // add a new person
   await page.locator('#personid').fill('9')
   await page.locator('#name').fill('James Mark')
   await page.locator('#address').fill('Edinburgh')
   await page.locator('#dob').fill('1990-01-01')
   await page.locator('#license').fill('')
   await page.locator('#expire').fill('2030-01-01')
   await page.getByRole('button', { name: 'Add owner' }).click();

   await expect(page.locator('#message')).toContainText('Error. At least one field is empty.')

}) 



