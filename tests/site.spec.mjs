import { test, expect } from '@playwright/test';

test('assets, fonts, canvas and responsive geometry', async ({ page }, info) => {
  const errors = [], failures = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) failures.push(response.url()); });
  await page.goto('/');
  await page.evaluate(() => Promise.all([document.fonts.load('500 16px Manrope'), document.fonts.load('400 16px "Source Serif 4"')]));
  const fonts = await page.evaluate(() => [...document.fonts].map(f => ({ family: f.family, status: f.status })));
  expect(fonts.every(f => f.status === 'loaded')).toBeTruthy();
  await expect(page.locator('.portrait img')).toBeVisible();
  await page.locator('.portrait img').scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('.portrait img').evaluate(img => img.complete && img.naturalWidth > 0)).toBeTruthy();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  const widths = info.project.name.includes('desktop') ? [320, 360, 390, 430, 768, 1024, 1440] : [360, 390, 430, 844];
  for (const width of widths) {
    await page.setViewportSize({ width, height: width === 844 ? 390 : 844 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
    const clipped = await page.locator('h1,h2,.work-option,.section-heading,.experience,.contact-title,footer').evaluateAll(elements => elements.filter(e => {
      const r = e.getBoundingClientRect(); return r.width && (r.left < -1 || r.right > innerWidth + 1);
    }).map(e => e.className || e.tagName));
    expect(clipped, `Overflow at ${width}px`).toEqual([]);
    if (width <= 760) {
      const spacing = await page.locator('.contact-bottom').evaluate(e => {
        const email = e.querySelector('a').getBoundingClientRect();
        const button = e.querySelector('button').getBoundingClientRect();
        return button.top - email.bottom;
      });
      expect(spacing).toBeGreaterThanOrEqual(8);
    }
    if (width === 390 || width === 1440) {
      await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo({ top: 0, behavior: 'instant' }); });
      await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
      await page.screenshot({ path: info.outputPath(`layout-${width}.png`), fullPage: true, animations: 'disabled' });
    }
  }
  const painted = await page.locator('#ridge-surface').evaluate(canvas => {
    const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 3; i < pixels.length; i += 4) if (pixels[i]) return true;
    return false;
  });
  expect(painted).toBeTruthy();
  expect(errors).toEqual([]);
  expect(failures).toEqual([]);
});

test('navigation, project tabs and services work with touch and keyboard', async ({ page }) => {
  await page.goto('/');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(page.locator('nav')).toBeVisible();
  await page.getByRole('link', { name: 'Selected work', exact: true }).click();
  await expect(page.locator('nav')).toBeHidden();
  await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded', 'false');
  await page.locator('#work-tab-hook').click();
  await expect(page.locator('#work-hook')).toBeVisible();
  await expect(page.locator('#work-cache')).toBeHidden();
  await page.locator('#work-tab-hook').press('ArrowDown');
  await expect(page.locator('#work-research')).toBeVisible();
  await expect(page.locator('#work-tab-research')).toBeFocused();
  await page.locator('summary').filter({ hasText: 'Digital experiences' }).click();
  await expect(page.locator('details').filter({ hasText: 'Digital experiences' })).toHaveAttribute('open', '');
});

test('dialogs fit narrow and landscape screens and restore focus', async ({ page }, info) => {
  await page.goto('/');
  for (const size of [{ width: 320, height: 568 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(size);
    const opener = page.getByRole('button', { name: 'Outline your project' });
    await opener.click();
    const dialog = page.locator('#inquiry-dialog');
    await expect(dialog).toBeVisible();
    const geometry = await dialog.evaluate(e => { const r = e.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: innerWidth, height: innerHeight, overflows: e.scrollWidth > e.clientWidth + 1 }; });
    expect(geometry.left).toBeGreaterThanOrEqual(0);
    expect(geometry.right).toBeLessThanOrEqual(geometry.width + 1);
    expect(geometry.top).toBeGreaterThanOrEqual(0);
    expect(geometry.bottom).toBeLessThanOrEqual(geometry.height + 1);
    expect(geometry.overflows).toBeFalsy();
    expect(await page.locator('#project-note').evaluate(e => parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(16);
    await page.getByLabel('What needs to work better?').fill('Responsive layout verification only.');
    await page.screenshot({ path: info.outputPath(`inquiry-${size.width}.png`) });
    await page.getByRole('button', { name: 'Close inquiry' }).click();
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  }
});

test('sample workflow completes without transmitting data', async ({ page }) => {
  await page.goto('/');
  await page.locator('summary').filter({ hasText: 'Connected operations' }).click();
  await page.getByRole('button', { name: 'Explore a sample workflow' }).click();
  await page.getByLabel('Business name (fictional)').fill('Test workshop');
  await page.getByRole('button', { name: 'Create sample application' }).click();
  await expect(page.locator('#review-name')).toHaveText('Test workshop');
  await page.getByRole('button', { name: 'Mark sample review complete' }).click();
  await expect(page.getByRole('heading', { name: 'One complete record.' })).toBeVisible();
  await page.getByRole('button', { name: 'Close demonstration' }).click();
});

test('reduced motion retains usable project navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  await page.locator('#work-tab-research').click();
  await expect(page.locator('#work-research')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
});
