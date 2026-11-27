import { test, expect } from './browser.mjs';

test('the hero arrow changes direction at its rail, stays clickable and returns keyboard focus', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const wrapper = page.locator('#down-arrow-sticky-wrapper');
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
});

test('editorial images load and are visible before the first scroll', async ({page}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const path of ['/', '/resources/', '/work/evaluation/']) {
    await page.goto(path);
    await expect.poll(() => page.evaluate(() => [...document.images]
      .filter(img => img.currentSrc || img.src)
      .every(img => img.complete && img.naturalWidth > 0))).toBe(true);
    await expect(page.locator('[data-art-reveal]')).toHaveCount(0);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  }
});

test('article templates keep just one pinned arrow above the scrolled page', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const route of ['/demos/finder/', '/services/websites/']) {
    await page.goto(route);
    await page.locator('#blog-lg-img').evaluate(image => {
      // Exercise the editorial banner before the workspace can reach the sticky shortcut.
      const bannerTop = document.getElementById('workspace') ? 180 : 76;
      window.scrollTo({ top: image.getBoundingClientRect().top + scrollY - bannerTop, behavior: 'instant' });
    });
    const rail = page.locator('#down-arrow');
    await expect(rail).toHaveCSS('position', 'fixed');
    await expect(rail.locator('.down')).toHaveCSS('opacity', '0');
    await expect(rail.locator('.up')).toHaveCSS('opacity', '1');
    await expect(rail.locator('.up')).toHaveAttribute('aria-hidden', 'false');
    const position = await rail.locator('.up').boundingBox();
    const size = page.viewportSize();
    const strip = page.locator('html.ref-contact-docked #contact-form');
    if (size.width < 992 && await strip.count()) {
      const box = await strip.boundingBox();
      const input = await strip.locator('#name').boundingBox();
      expect(position.y).toBeGreaterThanOrEqual(box.y);
      expect(position.y + position.height).toBeLessThanOrEqual(box.y + box.height);
      expect(position.width).toBeGreaterThanOrEqual(44);
      expect(position.x + position.width).toBeLessThanOrEqual(input.x);
    } else {
      expect(position.y).toBeCloseTo(size.width < 768 ? size.height - 170 : 180, 0);
    }
  }
});

test('public-service records follow flat circular tracks, pause, and stay still for reduced motion', async ({page}) => {
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/#apps');
  const wheel = page.locator('.app-wheel');
  await wheel.scrollIntoViewIfNeeded();
  await expect(wheel).toHaveAttribute('data-orbit-running', '');
  const toggle = wheel.getByRole('button', {name:'Pause app previews'});
  await toggle.press('Enter');
  await expect(wheel).not.toHaveAttribute('data-orbit-running', '');
  const poses = await wheel.evaluate(el => {
    const image = el.querySelector('.wheel-ring img');
    const box = time => {
      el.getAnimations({subtree:true}).forEach(animation => { animation.currentTime = time; });
      const r = image.getBoundingClientRect();
      return {x:r.x, y:r.y, size:r.width};
    };
    const cycle = el.querySelector('.wheel-ring').getAnimations()[0].effect.getTiming().duration;
    return [box(0), box(cycle/4), box(cycle/2), box(cycle)];
  });
  expect(Math.hypot(poses[0].x - poses[2].x, poses[0].y - poses[2].y)).toBeGreaterThan(12);
  expect(Math.abs(poses[0].size - poses[2].size)).toBeLessThan(1);
  expect(Math.hypot(poses[0].x - poses[3].x, poses[0].y - poses[3].y)).toBeLessThan(1);
  await wheel.getByRole('button', {name:'Play app previews'}).press('Space');
  await expect(wheel).toHaveAttribute('data-orbit-running', '');
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(wheel.getByRole('button')).toHaveCount(0);
  expect(await wheel.evaluate(el=>el.getAnimations({subtree:true}).length)).toBe(0);
  await expect(wheel.locator('.wheel-ring')).toHaveCount(3);
  await expect(wheel.locator('img')).toHaveCount(6);
});
