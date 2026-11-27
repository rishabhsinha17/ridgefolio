import { test, expect } from './browser.mjs';

test('site search can retry an index failure, clear an empty query and return via browser Back', async ({ page }) => {
  await page.route('**/assets/search.json', route => route.fulfill({ status:503, body:'Unavailable' }));
  await page.goto('/search/?q=brief');
  await expect(page.getByRole('button', {name:'Retry search'})).toBeVisible();
  await page.unroute('**/assets/search.json');
  await page.getByRole('button', {name:'Retry search'}).click();
  await expect(page.locator('#site-results a[href="/resources/project-brief/"]')).toBeVisible();
  const query = page.locator('#query');
  await query.fill('no-local-page-xyz123');
  await query.press('Enter');
  await expect(page.locator('#results-count')).toContainText('No matching pages');
  await page.getByRole('button',{name:'Clear search'}).click();
  await expect(query).toBeFocused();
  await expect(query).toHaveValue('');
  await page.goBack();
  await expect(query).toHaveValue('no-local-page-xyz123');
  await page.goBack();
  await expect(query).toHaveValue('brief');
});

test('previewing a contact inquiry preserves edits and excludes hidden fields', async ({ page }) => {
  await page.goto('/contact/');
  const form = page.locator('#contactform');
  await form.locator('#name').fill('Local reviewer');
  await form.locator('#email').fill('reviewer@example.invalid');
  await form.locator('#subject').selectOption('Delivery partnership');
  await form.locator('#find').fill('Example organization');
  await form.locator('#comments').fill('Local verification');
  await form.locator('[type=submit]').click();
  const preview = page.locator('#contact #message');
  await expect(preview.locator('textarea')).toHaveValue(/Example organization/);
  await preview.locator('textarea').fill('Revised locally');
  // Inspect the prepared destination as text; never activate a mail handler.
  await expect(preview.locator('a')).toHaveAttribute('href', /Revised%20locally/);
  await form.locator('#subject').selectOption('Other inquiry');
  await expect(preview).toBeHidden();
  await form.locator('[type=submit]').click();
  await expect(preview.locator('textarea')).not.toHaveValue(/Example organization/);
});

test('a blank project name keeps the worksheet available for correction', async ({ page }) => {
  await page.goto('/resources/project-brief/');
  const name = page.getByLabel('Project name');
  await name.fill('   ');
  await page.getByRole('button',{name:'Download my brief'}).click();
  await expect(name).toBeFocused();
  expect(await name.evaluate(el => el.validity.customError)).toBe(true);
  await name.fill('Library services');
  expect(await name.evaluate(el => el.validity.valid)).toBe(true);
});
