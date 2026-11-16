import { test, expect } from '@playwright/test';

test('production assets, fonts and responsive geometry', async ({ page }, info) => {
  const errors = [], failures = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) failures.push(response.url()); });
  await page.goto('/');
  await page.evaluate(() => Promise.all([document.fonts.load('500 16px Manrope'), document.fonts.load('400 16px SourceSerif')]));
  expect(await page.evaluate(() => [...document.fonts].every(font => font.status === 'loaded'))).toBeTruthy();
  await expect(page.locator('.field-art img')).toBeVisible();
  await expect.poll(() => page.locator('.field-art img').evaluate(img => img.complete && img.naturalWidth > 0)).toBeTruthy();
  await page.locator('.founder-signature img').scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('.founder-signature img').evaluate(img => img.complete && img.naturalWidth > 0)).toBeTruthy();
  const widths = info.project.name.includes('desktop') ? [320, 360, 390, 430, 768, 1024, 1440] : [360, 390, 430, 844];
  for (const width of widths) {
    await page.setViewportSize({ width, height: width === 844 ? 390 : 844 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 ? [] : [{
      width: innerWidth,
      scroll: document.documentElement.scrollWidth,
      overflowing: [...document.querySelectorAll('body *')].filter(element => {
        const rect = element.getBoundingClientRect();
        return rect.width && (rect.left < -1 || rect.right > innerWidth + 1) && getComputedStyle(element).position !== 'fixed';
      }).slice(0, 10).map(element => ({ tag: element.tagName, class: element.className, right: element.getBoundingClientRect().right }))
    }]), { message: `No horizontal overflow at ${width}px` }).toEqual([]);
    const clipped = await page.locator('h1,h2,.field-work-row,.field-contact,footer').evaluateAll(elements => elements.filter(element => {
      const r = element.getBoundingClientRect(); return r.width && (r.left < -1 || r.right > innerWidth + 1);
    }).map(element => element.className || element.tagName));
    expect(clipped, `Overflow at ${width}px`).toEqual([]);
    if (width === 390 || width === 1440) {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.screenshot({ path: info.outputPath(`layout-${width}.png`), fullPage: true, animations: 'disabled' });
    }
  }
  await expect(page.locator('.review-dock')).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index,follow');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://ridgefolio.com/');
  expect(errors).toEqual([]);
  expect(failures).toEqual([]);
});

test('mobile navigation, keyboard dismissal and contact destinations', async ({ page }) => {
  await page.goto('/');
  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.getByRole('button', { name: 'Menu', exact: true });
  await menu.click();
  await expect(page.locator('#site-nav')).toBeVisible();
  await page.getByRole('link', { name: 'Selected work', exact: true }).click();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#site-nav')).toBeHidden();
  await menu.click();
  await menu.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeFocused();
  await expect(page.locator('.contact-email')).toHaveAttribute('href', 'mailto:rsinha17@terpmail.umd.edu');
  await expect(page.locator('.field-contact > a')).toHaveAttribute('href', /^mailto:rsinha17@terpmail\.umd\.edu/);
  await expect(page.locator('.field-work-row').nth(1)).toHaveAttribute('href', 'https://github.com/IBM/vLLM-Hook/pull/41');
  await expect(page.locator('.field-work-row').nth(2)).toHaveAttribute('href', 'https://arxiv.org/abs/2610.37679');
});

test('reduced motion preserves the static sculpture and navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  const image = page.locator('.field-art img');
  expect(await image.evaluate(element => getComputedStyle(element).transform)).toBe('none');
  expect(await image.evaluate(element => getComputedStyle(element).transitionDuration)).toBe('0s');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await expect(page.locator('#site-nav')).toBeVisible();
});

test('not-found page provides a styled way home', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page.getByRole('heading', { name: 'This page isn’t here.' })).toBeVisible();
  await page.getByRole('link', { name: 'Back to Ridgefolio' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Better systems.Strongerplaces.');
});
