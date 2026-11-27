import { chromium } from "@playwright/test";
import sharp from "sharp";

const origin = new URL(process.env.RIDGEFOLIO_PREVIEW_ORIGIN || "http://127.0.0.1:8787").origin;
const assets = "public/assets/";
const scenes = {
  finder: { selector: ".finder-app", wide: [2960, 2820], narrow: [1700, 3880] },
  "permit-desk": { selector: "#permit-workspace", wide: [2960, 2444], narrow: [1530, 2510] },
  "service-ledger": { selector: "#service-ledger", wide: [2960, 2372], narrow: [1700, 2900] },
};

function save(frame, path, width, height) {
  const picture = sharp(frame).resize(width, height, { fit: "cover", position: "north" });
  return path.endsWith(".jpg")
    ? picture.jpeg({ quality: 91, chromaSubsampling: "4:4:4" }).toFile(assets + path)
    : picture.webp({ quality: 90, smartSubsample: true }).toFile(assets + path);
}

async function capture(page, selector) {
  await page.evaluate(() => document.fonts.ready);
  return page.locator(selector).screenshot({
    animations: "disabled", caret: "hide",
    style: "[data-ref-header], #down-arrow-sticky-wrapper, #contact-form { visibility: hidden !important; }",
  });
}

// Keep each permit capture consistent with the downloadable worked example.
const stamp = (page, iso) => page.clock.setFixedTime(new Date("2027-04-" + iso + "Z"));

async function exercise(page, slug) {
  const scene = scenes[slug];
  const suffix = slug === "service-ledger" ? "?district=South&group=service&sort=most&record=RF-205" : "";
  await stamp(page, "05T16:00:00");
  await page.goto(origin + "/demos/" + slug + "/" + suffix + "#workspace");
  if (slug === "finder") {
    await page.getByLabel("Search services").fill("permit");
    const entry = page.locator("#service-community-event-permit");
    await entry.locator("summary").click();
    await entry.getByRole("checkbox", { name: "Event name", exact: true }).check();
    await entry.getByRole("checkbox", { name: "Event date", exact: true }).check();
  }
  if (slug === "service-ledger") {
    await page.locator("#log-RF-205").waitFor({ state: "visible" });
  }
  if (slug !== "permit-desk") {
    const frame = await capture(page, scene.selector);
    return { directory: frame, feature: frame };
  }

  await page.getByLabel("Event name").fill("Neighborhood art fair");
  await page.getByLabel("Event date").fill("2027-05-15");
  await page.getByLabel("Expected attendance").fill("120");
  await page.getByLabel("Event plan").fill("Outdoor art tables and a marked pedestrian entrance.");
  await stamp(page, "05T16:24:00");
  await page.getByRole("button", { name: "Submit application", exact: true }).click();
  await page.getByLabel("Correction to request").fill("Name the entrance");
  await stamp(page, "05T17:40:00");
  await page.getByRole("button", { name: "Request correction", exact: true }).click();
  const directory = await capture(page, scene.selector);
  await page.getByLabel("Event location").fill("Harbor Square, east entrance");
  await stamp(page, "06T15:20:00");
  await page.getByRole("button", { name: "Resubmit correction" }).click();
  const feature = await capture(page, scene.selector);
  await stamp(page, "06T16:15:00");
  await page.getByRole("button", { name: "Approve permit" }).click();
  return { directory, feature, approval: await capture(page, scene.selector) };
}

const browser = await chromium.launch();
try {
  for (const [width, height, scale, layout] of [[1320, 960, 4, "wide"], [430, 900, 5, "narrow"]]) {
    const context = await browser.newContext({
      viewport: { width, height }, deviceScaleFactor: scale, reducedMotion: "reduce",
      locale: "en-US", timezoneId: "America/Los_Angeles",
    });
    await context.route(/^https?:/, route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    for (const [slug, scene] of Object.entries(scenes)) {
      const page = await context.newPage();
      const { directory, feature, approval } = await exercise(page, slug);
      await save(directory, "directory-evidence/" + slug + "-demo-" + layout + ".webp", ...scene[layout]);
      if (layout === "wide") {
        await save(feature, "previews/" + slug + ".jpg", 1200, 755);
        for (const w of [960, 1920, 3840]) {
          await save(feature, "article-evidence/" + slug + (w === 3840 ? "" : "-" + w) + ".webp", w, w * 2 / 3);
        }
        if (approval) {
          for (const [w, h] of [[720, 321], [1440, 642], [2560, 1141]]) {
            await save(approval, "article-evidence/permit-approval" + (w === 2560 ? "" : "-" + w) + ".webp", w, h);
          }
        }
      } else if (slug !== "permit-desk") {
        await save(feature, "home-evidence/" + slug + ".webp", 1550, 2480);
      }
      await page.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
}
