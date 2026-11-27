// Render the exact record states used in the service-page illustrations.
import { chromium } from '@playwright/test';
import sharp from 'sharp';

const origin = new URL(process.env.RIDGEFOLIO_PREVIEW_ORIGIN || 'http://127.0.0.1:8787').origin;
const browser = await chromium.launch();
try {
  for (const [layout, width, density] of [['wide', 1340, 3], ['narrow', 400, 3]]) {
    const page = await browser.newPage({viewport:{width, height:920}, deviceScaleFactor:density, reducedMotion:'reduce'});
    await page.route(/^https?:/, route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    async function capture(selector, name) {
      await page.evaluate(() => document.fonts.ready);
      const image = await page.locator(selector).screenshot({animations:'disabled', caret:'hide',
        style:'[data-ref-header], #down-arrow-sticky-wrapper, #contact-form {visibility:hidden!important}'});
      await sharp(image).webp({quality:89, smartSubsample:true}).toFile('public/assets/directory-evidence/'+name+'-'+layout+'.webp');
    }
    await page.goto(origin+'/demos/finder/#workspace');
    await page.getByLabel('Search services').fill('picnic');
    const shelter = page.locator('#service-park-shelter-reservation');
    await shelter.locator('summary').click();
    await shelter.getByLabel('Park and shelter name').check();
    await capture('.finder-app', 'shelter');
    await page.goto(origin+'/work/industrial-parks/#the-map');
    await page.locator('.atlas-tools').waitFor({state:'visible'});
    if (layout === 'narrow') await page.locator('#atlas-region').selectOption('Sulawesi');
    await capture('[data-atlas]', 'atlas');
    await page.close();
  }
} finally {
  await browser.close();
}
