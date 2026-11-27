import { test, expect } from './browser.mjs';

test('the hero arrow changes direction at its rail, stays clickable and returns keyboard focus', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const wrapper = page.locator('#down-arrow-sticky-wrapper');
  await expect(wrapper).toHaveCSS('height', '0px');
  expect(await wrapper.evaluate(el => el.style.minHeight)).toBe('');
  const origin = await wrapper.evaluate(element => element.getBoundingClientRect().top + window.scrollY);
  const scroll = y => page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), y);
  const forward = wrapper.getByRole('link', { name: 'Explore the practice' });
  await scroll(origin - 203);
  await expect(forward).toBeVisible();
  await forward.focus();
  await scroll(origin - 197);
  const back = wrapper.getByRole('link', { name: 'Back to the top' });
  await expect(back).toBeFocused();
  const hit = () => back.evaluate(link => {
    const rect = link.getBoundingClientRect();
    return rect.width >= 44 && rect.height >= 44 && rect.left >= 0 &&
      rect.right <= document.documentElement.clientWidth &&
      link.contains(document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2));
  });
  await expect.poll(hit).toBe(true);
  await scroll(origin + page.viewportSize().height * 2);
  await expect.poll(hit).toBe(true);
  await back.press('Enter');
  await expect(page).toHaveURL(/#home-hero$/);
  await expect(forward).toBeVisible();
  await expect(back).toHaveCount(0);
});

test('reduced motion leaves manual carousel navigation and a single vector per link', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const rail = page.locator('.project-carousel');
  await expect(rail.locator('.rf-rotation')).toBeHidden();
  await expect(rail.getByRole('button', { name: 'Next project' }).locator('svg')).toHaveCount(1);
  const record = page.locator('.testimonials .owl-item:not(.cloned) [role=link]').first();
  await expect(record.locator('svg.rf-diagonal-arrow')).toHaveCount(1);
  expect(await record.evaluate(link => getComputedStyle(link, '::after').content)).toBe('none');
  await expect(page.locator('[data-art-reveal="waiting"]')).toHaveCount(0);
});

test('article templates keep a single unobstructed scroll shortcut or the footer fallback', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const route of ['/work/evaluation/', '/services/websites/']) {
    await page.goto(route);
    await page.locator('#blog-lg-img').evaluate(image => {
      window.scrollTo({ top: Math.max(410, image.getBoundingClientRect().top + scrollY - 76), behavior: 'instant' });
    });
    const rail = page.locator('#down-arrow');
    await expect(rail).toHaveCSS('position', 'fixed');
    await expect(rail.locator('.down')).toHaveCSS('opacity', '0');
    await expect(page.locator('.footer-return')).toHaveAttribute('href','#top');
    await expect.poll(() => rail.evaluate(container => {
      const link = container.querySelector('.up');
      const b = link.getBoundingClientRect();
      const style = getComputedStyle(link);
      const hit = link.contains(document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2));
      if (container.hasAttribute('data-rail-covered')) {
        // The hero art under the rail is readable/clickable and its hidden
        // shortcut is not painted, hittable or in the keyboard sequence.
        const underlying = [1,25,49].some(x => [1,25,49].some(y =>
          document.elementsFromPoint(b.left + x, b.top + y).some(el =>
            el.closest('img[alt]:not([alt=""]),a[href],button,canvas,h1,h2,h3,p,figcaption,.workspace') &&
            !el.closest('#down-arrow,[hidden]'))));
        return underlying && !hit && style.visibility === 'hidden' && style.opacity === '0' &&
          style.pointerEvents === 'none' && link.inert && link.tabIndex === -1 &&
          link.getAttribute('aria-hidden') === 'true';
      }
      return hit && style.visibility === 'visible' && style.opacity === '1' &&
        !link.inert && link.tabIndex === 0 && link.getAttribute('aria-hidden') === 'false' &&
        b.width >= 44 && b.height >= 44 && b.left >= 0 && b.right <= document.documentElement.clientWidth;
    })).toBe(true);
  }
});

test('the first keyboard link stays visible above the header and focuses its heading', async ({ page }) => {
  await page.emulateMedia({ reducedMotion:'reduce' });
  for (const route of ['/', '/services/websites/']) {
    await page.goto(route);
    const skip = page.locator('.skip');
    await skip.focus();
    const hit = await skip.evaluate(link => {
      const r = link.getBoundingClientRect();
      return link.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2));
    });
    expect(hit).toBe(true);
    await skip.press('Enter');
    await expect(page.locator('h1:focus')).toBeVisible();
    if (route === '/') expect(await page.locator('#home-hero').evaluate(el => el.scrollTop)).toBe(0);
  }
});

test('task pages keep the workspace clear while retaining navigation to contact', async ({ page }) => {
  await page.emulateMedia({ reducedMotion:'reduce' });
  for (const route of ['/demos/finder/','/demos/permit-desk/','/demos/service-ledger/',
    '/resources/project-brief/','/resources/launch-checklist/','/search/']) {
    await page.goto(route);
    await page.evaluate(() => window.scrollTo({top:1000,behavior:'instant'}));
    await expect(page.locator('#contact-form')).toBeHidden();
    await expect(page.locator('footer a[href="/contact/"]').first().or(page.locator('.copyright a[href="/contact/"]')).first()).toHaveAttribute('href','/contact/');
  }
});
