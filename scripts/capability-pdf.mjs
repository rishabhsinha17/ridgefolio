import { chromium } from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { resolve } from "node:path";
const root = resolve("public");
const server = createServer(async (req, res) => {
  const path = new URL(req.url, "http://localhost").pathname;
  try {
    const file = root + (path.endsWith("/") ? path + "index.html" : path);
    const types = {
      css: "text/css",
      js: "text/javascript",
      html: "text/html",
      woff2: "font/woff2",
      ttf: "font/ttf",
    };
    const body = await readFile(file);
    res.writeHead(200, {
      "Content-Type":
        types[file.split(".").pop()] || "application/octet-stream",
    });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(
    "http://127.0.0.1:" + server.address().port + "/resources/capabilities/",
  );
  await page.locator('a[href^="/"]').evaluateAll((links) =>
    links.forEach((link) => {
      link.href = new URL(
        link.getAttribute("href"),
        "https://ridgefolio.com",
      ).href;
    }),
  );
  await page.emulateMedia({ media: "print" });
  await page.evaluate(() => document.fonts.ready);
  await mkdir("public/downloads", { recursive: true });
  await page.pdf({
    path: "public/downloads/ridgefolio-capabilities.pdf",
    preferCSSPageSize: true,
    tagged: true,
    printBackground: true,
  });
} finally {
  await browser?.close();
  server.close();
}
