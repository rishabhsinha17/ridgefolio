import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const origin = process.env.RIDGEFOLIO_PREVIEW_ORIGIN || "http://127.0.0.1:8787";
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1050, height: 820 },
    deviceScaleFactor: 1,
  });
  await mkdir("public/assets/previews", { recursive: true });
  for (const slug of ["finder", "permit-desk", "service-ledger"]) {
    await page.goto(new URL("/demos/" + slug + "/", origin).href);
    if (slug === "finder")
      await page.getByText("Community event permit", { exact: true }).click();
    if (slug === "permit-desk")
      await page.getByRole("button", { name: "Submit application" }).click();
    if (slug === "service-ledger")
      await page.getByLabel("District", { exact: true }).selectOption("South");
    await page.evaluate(() => document.fonts.ready);
    await page
      .locator(".workspace")
      .screenshot({
        path: "public/assets/previews/" + slug + ".jpg",
        type: "jpeg",
        quality: 85,
        animations: "disabled",
      });
  }
} finally {
  await browser.close();
}
