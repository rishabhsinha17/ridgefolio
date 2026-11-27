// Crop originals to the small perspective cards at four times their CSS width.
import { execFileSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const cards = JSON.parse(execFileSync("python3", ["-c",
  "import json, sys; sys.path.insert(0, 'site'); from homepage import HERO_SCREENS; print(json.dumps(HERO_SCREENS))"
], { encoding: "utf8" }));
const directory = "public/assets/hero-cards";
await mkdir(directory, { recursive: true });
for (const [number, asset] of cards) {
  if (!asset?.endsWith(".webp")) continue;
  // The checklist and capability statement are portrait cards.
  const width = number === 19 || number === 20 ? 480 : 1000;
  const ratio = number === 19 ? 0.69 : number === 20 ? 0.85 : 1.69;
  await sharp("public/assets/" + asset).resize(width, Math.round(width / ratio), { fit: "cover" })
    .webp({ quality: 88, smartSubsample: true }).toFile(directory + "/card-" + number + ".webp");
}

// Refresh the sharing image from the same rendered hero after rebuilding the site.
if (process.argv.includes("--share")) {
  const { chromium } = await import("@playwright/test");
  const origin = new URL(process.env.RIDGEFOLIO_PREVIEW_ORIGIN || "http://127.0.0.1:8787").origin;
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 756 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
    await page.route(/^https?:/, route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    await page.goto(origin + "/");
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.querySelectorAll("#home-hero img")].map(image => image.decode()));
    });
    const hero = await page.screenshot({ animations: "disabled" });
    await sharp(hero).resize(1920, 1008).jpeg({quality:90, chromaSubsampling:"4:4:4"}).toFile("public/assets/home-evidence/homepage-share.jpg");
  } finally {
    await browser.close();
  }
}
