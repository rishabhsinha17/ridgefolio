import { test, expect } from './browser.mjs';

test('interior pages keep their skip target, page gutters and footer grid', async ({ page, request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  const routes = [...sitemap.matchAll(/<loc>https:\/\/ridgefolio\.com(\/[^<]+)<\/loc>/g)].map(match => match[1]);
  expect(routes).toHaveLength(22);
  const width = page.viewportSize().width;
  for (const route of routes) {
    await page.goto(route);
    const layout = await page.evaluate(() => {
      const skip = document.querySelector('.skip');
      const heading = document.getElementById(skip.hash.slice(1));
      const blocks = [...document.querySelectorAll('[data-ref-footer] .container > .row > div')];
      const [first, second, search] = blocks.map(element => element.getBoundingClientRect());
      const input = document.querySelector('#mc-email').getBoundingClientRect();
      return {
        pageWidth: document.documentElement.scrollWidth,
        heading: heading?.textContent.trim(),
        headingExposed: !!heading?.getBoundingClientRect().height && !heading.closest('[hidden],[aria-hidden="true"]'),
        stacked: second.top >= first.bottom - 1 && search.top >= second.bottom - 1,
        searchWidth: Math.round(input.width),
        missingAnchors: [...document.querySelectorAll('a[href^="#"]')].filter(link => link.hash.length > 1 &&
          link.getClientRects().length && !document.getElementById(decodeURIComponent(link.hash.slice(1)))).map(link => link.hash)
      };
    });
    expect(layout.heading, route).toBeTruthy();
    expect(layout.headingExposed, route).toBe(true);
    expect(layout.pageWidth, route).toBeLessThanOrEqual(width + 1);
    expect(layout.missingAnchors, route).toEqual([]);
    expect(layout.stacked, route).toBe(width < 992);
    expect(layout.searchWidth, route).toBeGreaterThan(width < 992 ? width * .72 : width * .30);
  }
});

test('a service banner link follows its own destination', async ({ page }) => {
  await page.goto('/services/websites/');
  const link = page.locator('#blog-lg-img .pixel-btn a');
  const destination = new URL(await link.getAttribute('href'), page.url());
  await link.click();
  await expect(page).toHaveURL(destination.href);
  await expect(page.locator('#contact-form')).not.toHaveAttribute('aria-modal', 'true');
});

test('contact opens deliberately, advances and returns focus to the triggering link', async ({ page }) => {
  await page.goto('/pricing/');
  const sheet = page.locator('#contact-form');
  await page.evaluate(() => window.scrollTo({top:550, behavior:'instant'}));
  await expect(sheet).toBeHidden();
  const header = page.locator('[data-ref-header]');
  const contact = header.getByRole('link', {name:'Contact us', exact:true});
  await contact.click();
  await expect(sheet).toHaveAttribute('aria-modal', 'true');
  await expect(sheet.locator('#name')).toBeFocused();
  await sheet.getByRole('button', {name:'Continue', exact:true}).click();
  await expect(sheet.locator('#email')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(sheet).toBeHidden();
  await expect(header).not.toHaveAttribute('inert','');
  await expect(contact).toBeFocused();
});

test('project evidence keeps its space while images are downloading', async ({ page }) => {
  let release;
  const pending = new Set();
  const gate = new Promise(resolve => { release = resolve; });
  await page.route(/\/(paper-page\.webp|monitor-strata\.svg)$/, async route => {
    pending.add(new URL(route.request().url()).pathname);
    await gate;
    await route.continue();
  });
  try {
    await page.goto('/work/evaluation/', {waitUntil: 'domcontentloaded'});
    const media = page.locator('#responsive .responsive-shots img');
    const boxes = () => media.evaluateAll(images => images.map(image => Math.round(image.getBoundingClientRect().height)));
    await media.evaluateAll(images => images.forEach(image => { image.loading = 'eager'; }));
    await expect.poll(() => pending.size).toBe(2);
    const reserved = await boxes();
    expect(Math.min(...reserved)).toBeGreaterThan(25);
    release();
    await media.evaluateAll(images => Promise.all(images.map(image => image.decode())));
    expect(await boxes()).toEqual(reserved);
    if (page.viewportSize().width >= 992) {
      for (const path of ['/work/evaluation/', '/']) {
        if (path === '/') await page.goto(path);
        const section = page.locator('#responsive');
        await section.evaluate(element => scrollTo({ top: element.offsetTop + 180, behavior: 'instant' }));
        const sticky = section.locator('.col-md-5 > .sticky-element');
        await expect.poll(() => sticky.evaluate(element => {
          return Math.abs(element.getBoundingClientRect().top - parseFloat(getComputedStyle(element).top));
        })).toBeLessThan(2);
      }
    }
  } finally {
    release();
  }
});
