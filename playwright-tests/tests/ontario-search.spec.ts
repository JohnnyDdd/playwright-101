import { test, expect } from '@playwright/test';

test.describe('Ontario.ca Search', () => {

  test.beforeEach(async ({ context }) => {
    // Skip language splash page by setting English cookie
    await context.addCookies([{
      name: 'lang',
      value: 'en',
      domain: '.ontario.ca',
      path: '/'
    }]);
  });

  test('navigate to Ontario.ca search page', async ({ page }) => {
    // Scenario 1: Basic Navigation — page.goto(), toHaveTitle()
    console.log('CI pipeline verification');
    await page.goto('/search/search-results/?query=driver+licence');
    await expect(page).toHaveTitle(/ontario/i);
  });

  test('search for driver licence returns results', async ({ page }) => {
    // Scenario 2: Search and Verify — fill(), click(), text assertions
    await page.goto('/search/search-results/?query=driver+licence');
    await page.waitForSelector('h3 a');
    await expect(page.locator('h2').filter({ hasText: /results/ })).toBeVisible();
    await expect(page.locator('h3 a').first()).toBeVisible();
  });

  test('filter by topic narrows results', async ({ page }) => {
    // Scenario 3: Filter by Topic — checkbox interaction, Apply button
    await page.goto('/search/search-results/?query=driver+licence');
    await page.waitForSelector('h3 a');
    await page.locator('label').filter({ hasText: /driving/i }).first().click();
    await page.locator('[aria-label="Apply"]').click();
    await expect(page.locator('h3 a').first()).toBeVisible();
  });

  
  test('sort results by updated date', async ({ page }) => {
    // Scenario 4: Sort Results — radio button, dynamic content
    await page.goto('/search/search-results/?query=driver+licence');
    await page.waitForSelector('h3 a');
    await page.getByLabel('Updated date (new to old)').check();
    await page.locator('[aria-label="Apply"]').click();
    await expect(page.locator('h3 a').first()).toBeVisible();
  });
  
  test('pagination navigates to next page', async ({ page }) => {
    // Scenario 6: Pagination — click navigation, URL assertions
    await page.goto('/search/search-results/?query=driver+licence');
    await page.waitForSelector('.search-pagination-link');
    await page.locator('[aria-label="Go to page 2"]').click();
    await expect(
      page.locator('.search-pagination-link--active')
    ).toContainText('2');
  });
  
  test('search with no results shows empty state', async ({ page }) => {
    // Scenario 7: No Results Edge Case — negative testing
    await page.goto('/search/search-results/?query=xyznonexistentquery12345');
    await expect(
      page.locator('h2').filter({ hasText: /0 results/ })
    ).toBeVisible({ timeout: 10000 });
  });


  test('search input field is visible and functional', async ({ page }) => {
    // Bonus: Verify search input field presence and interaction
    await page.goto('/search/search-results/?query=driver+licence');
    const searchInput = page.getByRole('combobox', {name: 'Search'});
    await expect(searchInput).toBeVisible();
    await searchInput.clear();
    await searchInput.fill('health card');
    await searchInput.press('Enter');
    await page.waitForSelector('.result-title a');
    await expect(page.locator('.result-title a').first()).toBeVisible();
  });

  test('search for health card returns results', async ({ page }) => {
    await page.goto('/search?query=health+card');
    await page.waitForSelector('h3 a');
    await expect(page.locator('h2').filter({ hasText: /results/ })).toBeVisible();
    await expect(page.locator('h3 a').first()).toBeVisible();
  });


  test('intentional failure: expects the wrong government page title @failure-demo', async ({ page }) => {
    await page.goto('/search/search-results/?query=driver+licence');
    await expect(page).toHaveTitle(/ontario/i);

    await expect(
      page,
      'Intentional demo error: Ontario.ca is not the Government of Canada website'
    ).toHaveTitle(/Government of Canada/i);
  });

  test('intentional failure: expects the old query after editing search @failure-demo', async ({ page }) => {
    await page.goto('/search/search-results/?query=driver+licence');
    const searchInput = page.locator('#search-input-field');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('health card');

    await expect(
      searchInput,
      'Intentional demo error: the search value changed to health card, but the test expects the old query'
    ).toHaveValue('driver licence');
  });
});
