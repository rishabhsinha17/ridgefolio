import { test, expect } from './browser.mjs';
import { createHash } from 'node:crypto';

test('production assets, fonts and responsive geometry', async ({ page }, info) => {
  const errors = [], failures = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) failures.push(response.url()); });
  await page.goto('/');
  await page.evaluate(() => Promise.all([...document.fonts].map(face => face.load())));
  expect(await page.evaluate(() => [...document.fonts].every(font => font.status === 'loaded'))).toBeTruthy();
  const planes = page.locator('#home-hero .animatable img.card');
  await expect(planes).toHaveCount(4);
  await expect(page.getByRole('link', {name:'View the Indonesia industrial parks case study'})).toHaveAttribute('href', '/work/industrial-parks/');
  await expect.poll(() => planes.evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
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
    const clipped = await page.locator('h1,h2,footer').evaluateAll(elements => elements.filter(element => {
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
  const directory = page.locator('#site-directory');
  await expect(directory).toBeVisible();
  await directory.getByRole('link', { name: 'Selected work', exact: true }).click();
  await expect(page).toHaveURL(/\/work\/$/);
  await expect(directory).toBeHidden();
  await menu.click();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeFocused();

  await page.goto('/');
  await page.setViewportSize({ width: 1440, height: 900 });
  const contact = page.locator('header[data-ref-header] a.open-contact-form');
  await expect(contact).toHaveAttribute('href', '/contact/');
  await contact.click();
  const sheet = page.getByRole('dialog', { name: 'Contact Ridgefolio' });
  await expect(sheet).toBeVisible();
  await sheet.getByRole('button', { name: 'Continue' }).click();
  await expect(sheet.getByLabel('Reply email', {exact:false})).toBeVisible();
  await expect(sheet.getByRole('button', {name:'Review email draft'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(sheet).toBeHidden();
  await expect(contact).toBeFocused();
  await page.goto('/contact/');
  await expect(page.locator('a[href="mailto:rishabh@ridgefolio.com"]').first()).toHaveAttribute('href','mailto:rishabh@ridgefolio.com');
  await expect(page.locator('#contact-hero address').getByRole('link', {name:'Book a 30-minute call'})).toHaveAttribute('href','https://cal.com/ridgefolio/intro');
});

test('reduced motion preserves the static ridge and navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  await page.goto('/practice/');
  await page.locator('summary').filter({hasText:'Explore the terrain study'}).click();
  const before = await ridgeFingerprint(page);
  const box = await page.locator('.tech-canvas').boundingBox();
  await page.mouse.move(box.x + box.width * .8, box.y + box.height * .25);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  expect(await ridgeFingerprint(page)).toBe(before);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await expect(page.locator('#site-directory')).toBeVisible();
});

test('not-found page provides a styled way home', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page.getByRole('heading', { name: 'This page isn’t here.' })).toBeVisible();
  await page.getByRole('link', { name: 'Back to Ridgefolio' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Software for\s*public agencies\./);
});

async function ridgeFingerprint(page) {
  return page.locator('.tech-canvas').evaluate(canvas => {
    const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    let hash = 2166136261;
    for (let i = 0; i < data.length; i += 64) hash = Math.imul(hash ^ data[i] ^ (data[i+1] << 8) ^ (data[i+3] << 16), 16777619) >>> 0;
    return hash;
  });
}

test('surface and wireframe views work with keyboard and touch-sized controls', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/practice/');
  await page.locator('summary').filter({hasText:'Explore the terrain study'}).click();
  await page.setViewportSize({ width: 390, height: 844 });
  const surface = page.getByRole('button', { name: 'Surface', exact: true });
  const wireframe = page.getByRole('button', { name: 'Wireframe', exact: true });
  await surface.scrollIntoViewIfNeeded();
  await expect(surface).toHaveAttribute('aria-pressed', 'true');
  const original = await ridgeFingerprint(page);
  await wireframe.focus();
  await wireframe.press('Enter');
  await expect(wireframe).toHaveAttribute('aria-pressed', 'true');
  await expect(surface).toHaveAttribute('aria-pressed', 'false');
  expect(await ridgeFingerprint(page)).not.toBe(original);
  await surface.click();
  await expect(surface).toHaveAttribute('aria-pressed', 'true');
  expect(await ridgeFingerprint(page)).toBe(original);
  for (const control of [surface, wireframe]) {
    expect(await control.evaluate(element => element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
  }
});

// These are the ordered tag and class trees in the independent November 26
// homepage source capture. Copy, URLs, and project-specific assets are editable.
const sourceSections = {
  "squares": "348699838ad518c749909f8fb89043bd9cfd3d878fcae4eddef85d77e74f6a82",
  "header": "d7925330addfd46c0233fec57a916353f2c2ce3cae59bea89c66324c68132eea",
  // The hero now links four exhibits from the same project.
  "home-hero": "5062910342847c5d43e1f00ceb5cbae80b4390ae308871e1919e80d42fe1f8dc",
  "welcome-header": "7791812b80256dd64daaa51f5b5ba3825ae63063bf1500d32813416e07fdac96",
  "apps": "3b90ca171231c4522156b377c05057238432cffd25ba3af1acb8ef7d85c2069e",
  "our-work-header": "ea5dc3188f850fb36bcba003f4401ea678ae7fd2672a838f9e4fa398c1dc626b",
  "featured-projects": "e9d970f33fdf2ca22d4356c9896a667eceb269bc84acf5dfe66882b874b058f6",
  "responsive": "ed7882f181d700ea80c09d621c75f51368bd6ace0b1519e92a81765e1c5f2c57",
  "testimonials-header": "cc3fc5f6b2e7561b0f0c61cf2a70a3410871ab6f845b9e41539d1e2eaebdd576",
  "quotes": "349a5720e0b328ea1d7a6ac27e0682ce87c4a248bdc9ef2ff826d3e2e074558b",
  "blog-list": "a093718757939cd052f1b20713daff7640fb390d7ff3e04f0b79e8cb40e50bb5",
  "footer": "85f955cf367d0b8c8f3b08444af55eae886a1e5cc3c69a503a2af9b874bd8842",
  "copyright": "cb1d645c6ca8242127e3da69d15730bca2aff311f57503f229edbd4b8c201a48",
  "contact-form": "423f080dd3eb31d2af90feb06ff47e4c94bfb9a5ed1e6222c8757482ded27ed3"
};

test('homepage templates retain the source hierarchy before enhancement', async ({ page, request }) => {
  const response = await request.get('/');
  const sections = await page.evaluate(html => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    function shape(element) {
      const children = [...element.children].filter(child =>
        !['script', 'style', 'link', 'iframe', 'noscript'].includes(child.localName) && !child.matches('.footer-return')
      );
      return element.localName + '.' + [...element.classList].join('.') + '(' + children.map(shape).join('') + ')';
    }
    return [...doc.querySelector('.main-wrap').children].map(region => [
      region.id || region.classList[0] || region.localName, shape(region)
    ]);
  }, await response.text());
  expect(sections.map(([id]) => id)).toEqual(Object.keys(sourceSections));
  for (const [id, value] of sections) {
    expect(createHash('sha256').update(value).digest('hex'), id).toBe(sourceSections[id]);
  }
  await page.goto('/');
  await expect(page.locator('#quotes .owl-item')).toHaveCount(23);
  const enhanced = {
    "home-hero": "8b2602844921d61a929d7509a7d982d42366e06dd05a4aa0bc4f6259bd3c6b08",
    "featured-projects": "496677e2e35ae10d178924b62db062db0b19186a2eec58d37450f62b47d432c0",
    "quotes": "5695ccdb72ec1a272577c2c89573e0f03a35b467403f69a2d22fcd9d24c7bbd8"
};
  const liveTrees = await page.evaluate(ids => {
    const transient = new Set(['active', 'center', 'aos-init', 'aos-animate']);
    function tree(el) {
      // The source's unused pagination slot now holds the rotation control.
      // Its location, the two original nav controls, slide links and structure
      // still participate in the same source fingerprint.
      if (el.matches('.owl-dots.rf-rotation[role="button"]')) return 'div.owl-dots.disabled()';
      const classes = [...el.classList].filter(token => !transient.has(token));
      // The hero artwork now enters when visible, which can happen below the
      // first phone viewport. Compare the structure in its settled state.
      if (el.matches('.animatable') && !classes.includes('animated')) classes.push('animated');
      const structural = [...el.children].filter(child => !child.matches(
        'svg[aria-hidden="true"].rf-control-icon, svg[aria-hidden="true"].rf-diagonal-arrow'
      ));
      return el.localName + '.' + classes.join('.') + '(' + structural.map(tree).join('') + ')';
    }
    return ids.map(id => [id, tree(document.getElementById(id))]);
  }, Object.keys(enhanced));
  for (const [id, value] of liveTrees) {
    expect(createHash('sha256').update(value).digest('hex'), 'rendered ' + id).toBe(enhanced[id]);
  }
});

test('the landing caption clears the navigation and the handset uses a detailed screen', async ({page}) => {
  await page.goto('/');
  const clearance = await page.locator('#home-hero .caption-inner > span').evaluate(lead =>
    lead.getBoundingClientRect().top - document.querySelector('header').getBoundingClientRect().bottom
  );
  expect(clearance).toBeGreaterThanOrEqual(24);
  const handset = page.locator('#responsive .shot2');
  await handset.scrollIntoViewIfNeeded();
  await expect.poll(() => handset.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
  const image = await handset.evaluate(element => ({
    url: element.currentSrc,
    ratio: element.naturalWidth / element.naturalHeight,
  }));
  expect(image.url).toMatch(/atlas-iphone-(650|1308)\.webp$/);
  expect(image.ratio).toBeCloseTo(436 / 876, 2);
});

test('a project record advances its illustration and source credit together', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({width:1280,height:820});
  await page.goto('/');
  const panel = page.locator('#quotes #about');
  await panel.scrollIntoViewIfNeeded();
  const records = page.locator('.testimonials .owl-item:not(.cloned) > .item');
  const next = page.getByRole('button', {name:'Next record', exact:true});
  const expected = await records.evaluateAll(items => items.map(item => ({
    image:item.dataset.art, alt:item.dataset.alt, credit:item.dataset.credit
  })));
  for (const [index, record] of [...expected, expected[0]].entries()) {
    if (index) await next.click();
    await expect(panel.locator('img')).toHaveAttribute('data-art', record.image);
    await expect(panel.locator('img')).toHaveAttribute('alt', record.alt);
    await expect(panel).toHaveAttribute('data-credit', record.credit);
    await expect.poll(() => panel.locator('img').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  }
});
