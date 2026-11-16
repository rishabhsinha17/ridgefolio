import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve('public');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const css = readFileSync(resolve(root, 'assets/civic.css'), 'utf8');
for (const [file, text, pattern] of [
  ['index.html', html, /(?:src|href)="([^"#]+)"/g],
  ['assets/civic.css', css, /url\(['"]?([^'"\)]+)['"]?\)/g],
]) {
  for (const [, reference] of text.matchAll(pattern)) {
    if (/^(https?:|mailto:|data:)/.test(reference)) continue;
    const path = reference.split(/[?#]/)[0];
    assert(existsSync(path.startsWith('/') ? resolve(root, '.' + path) : resolve(root, dirname(file), path)), `Missing asset: ${file} -> ${reference}`);
  }
}
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(ids.length, new Set(ids).size, 'Duplicate element IDs');
for (const [, id] of html.matchAll(/(?:href="#|aria-controls=")([^" ]+)"/g)) assert(ids.includes(id), `Missing target: ${id}`);
assert(!html.includes('noindex'), 'Homepage must be indexable');
assert(!/review-dock|fieldnotes-options|design studies/i.test(html), 'Remove sample controls and metadata before publication');
assert(html.includes('https://ridgefolio.com/'), 'Canonical domain must be configured');
for (const [tag] of html.matchAll(/<(?:script|link)\b[^>]*>/gi)) {
  if (tag.startsWith('<script') || /rel="(?:stylesheet|preload)"/.test(tag)) assert(!/(?:src|href)="https?:/.test(tag), 'Keep runtime scripts and fonts self-hosted');
}
for (const file of ['404.html', 'robots.txt', 'sitemap.xml', '_headers', '_redirects']) assert(existsSync(resolve(root, file)), `Missing ${file}`);
console.log('Static assets, anchors, metadata and deployment files verified.');
