import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";

const root = resolve("public");
const html = readFileSync(resolve(root, "index.html"), "utf8");
const css = readFileSync(resolve(root, "assets/civic.css"), "utf8");
for (const [file, text, pattern] of [
  ["index.html", html, /(?:src|href)="([^"#]+)"/g],
  ["assets/civic.css", css, /url\(['"]?([^'"\)]+)['"]?\)/g],
]) {
  for (const [, reference] of text.matchAll(pattern)) {
    if (/^(https?:|mailto:|data:)/.test(reference)) continue;
    const path = reference.split(/[?#]/)[0];
    assert(
      existsSync(
        path.startsWith("/")
          ? resolve(root, "." + path)
          : resolve(root, dirname(file), path),
      ),
      `Missing asset: ${file} -> ${reference}`,
    );
  }
}
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
assert.equal(ids.length, new Set(ids).size, "Duplicate element IDs");
for (const [, id] of html.matchAll(/(?:href="#|aria-controls=")([^" ]+)"/g))
  assert(ids.includes(id), `Missing target: ${id}`);
assert(!html.includes("noindex"), "Homepage must be indexable");
assert(
  !/review-dock|fieldnotes-options|design studies/i.test(html),
  "Remove sample controls and metadata before publication",
);
assert(
  html.includes("https://ridgefolio.com/"),
  "Canonical domain must be configured",
);
for (const [tag] of html.matchAll(/<(?:script|link)\b[^>]*>/gi)) {
  if (tag.startsWith("<script") || /rel="(?:stylesheet|preload)"/.test(tag))
    assert(
      !/(?:src|href)="https?:/.test(tag),
      "Keep runtime scripts and fonts self-hosted",
    );
}
for (const file of [
  "404.html",
  "robots.txt",
  "sitemap.xml",
  "_headers",
  "_redirects",
])
  assert(existsSync(resolve(root, file)), `Missing ${file}`);
console.log("Static assets, anchors, metadata and deployment files verified.");

const sitemap = readFileSync(resolve(root, "sitemap.xml"), "utf8");
const routes = Array.from(
  sitemap.matchAll(/<loc>https:\/\/ridgefolio\.com([^<]*)<\/loc>/g),
  (match) => match[1],
);
assert(routes.length > 0, "Sitemap has no pages");
const titles = new Set();
for (const route of routes) {
  const body = readFileSync(resolve(root, "." + route, "index.html"), "utf8");
  assert(!/<img\b[^>]*\bloading="lazy"/i.test(body), route + " defers a page image until scroll");
  const title = body.match(/<title>([^<]+)<\/title>/)?.[1];
  assert(
    title && !titles.has(title),
    "Missing or duplicated title on " + route,
  );
  titles.add(title);
  assert(
    body.includes('rel="canonical" href="https://ridgefolio.com' + route + '"'),
    "Incorrect canonical URL on " + route,
  );
  for (const [, href] of body.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
    const target = resolve(root, "." + href.split(/[?#]/)[0]);
    assert(
      existsSync(target) &&
        (!statSync(target).isDirectory() ||
          existsSync(resolve(target, "index.html"))),
      route + " has a broken link to " + href,
    );
  }
}
console.log(
  "Verified page titles, canonical URLs and local destinations for " +
    routes.length +
    " pages.",
);

// Verify the draft in an isolated JavaScript context without a browser or OS handler.
const siteScript = readFileSync(resolve(root, "assets/site.js"), "utf8");
const isolated = { document: { getElementById: () => null } };
runInNewContext(siteScript, isolated);
const recipient = "rishabh@ridgefolio.com";
const subject = "Ridgefolio — Workflow or data project";
const example = "Workflow for agencies & partners + a pass.\nReview the permit page.";
const draft = new URL(isolated.contactDraftURL(recipient, subject, example));
assert.equal(draft.protocol, "mailto:");
assert.equal(draft.pathname, recipient);
assert.equal(draft.searchParams.get("subject"), subject);
assert.equal(draft.searchParams.get("body"), example.replace("\n", "\r\n"));
for (const file of ["ref-shell.js", "interiors.js"]) {
  const code = readFileSync(resolve(root, "assets", file), "utf8");
  assert(!/(?:location(?:\.href)?\s*=|location\.(?:assign|replace)\s*\(|window\.open\s*\()/.test(code),
    file + " must present the draft as a link for a separate visitor action");
}
console.log("Contact draft recipient, subject and body verified without a mail handler.");
