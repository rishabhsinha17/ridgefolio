// Set the homepage illustrations from published case material and the demos' own records.
import { execFileSync } from 'node:child_process';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

const root = resolve('public/assets');
const output = join(root, 'home-projects');
const catalog = JSON.parse(execFileSync('python3', ['-c', `
import sys, json
sys.path.insert(0, 'site')
from finder import SERVICES
from service_ledger import RECORDS
entry = next(s for s in SERVICES if s.slug == 'park-shelter-reservation')
rows = [r for r in RECORDS if r.district == 'South']
print(json.dumps(dict(service=entry.name, office=entry.desk,
    logs=[dict(key=r.key, service=r.service, hours=r.minutes/60) for r in rows])))
`], {encoding:'utf8'}));
const receipt = await readFile('public/downloads/sample-permit-receipt.txt', 'utf8');
function field(name) {
  const row = receipt.split('\n').find(line => line.startsWith(name + ': '));
  if (!row) throw new Error('Missing receipt field ' + name);
  return row.slice(name.length + 2);
}
const caseId = receipt.match(/Community event permit \| (RF-\d+)/)[1];
const hours = catalog.logs.reduce((sum, row) => sum + row.hours, 0);
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const img = (path, cls) => `<img class="${cls}" src="${path}">`;
const top = (left, right) => `<header><span>${left}</span><span>${right}</span></header>`;
const rules = catalog.logs.toSorted((a,b) => b.hours - a.hours).map(row =>
  `<div class="bar"><span>${esc(row.service)}</span><strong>${row.hours} h</strong><i style="--value:${row.hours/hours*100}%"></i></div>`).join('');
const styles = `
@font-face{font-family:Serif;src:url(fonts/source-serif-4-400.woff2)}
@font-face{font-family:Sans;src:url(fonts/manrope-variable.ttf);font-weight:200 800}
@font-face{font-family:Mono;src:url(fonts/ibm-plex-mono-latin.woff2)}
*{box-sizing:border-box}body{margin:0;color:#213c34;font:500 15px/1.35 Sans,Arial,sans-serif}
main{height:100vh;width:100vw;position:relative;overflow:hidden;background:#f5f1e6}
h1,h2,p{margin:0}h1,h2,.num{font:400 44px/1.04 Serif,Georgia,serif;letter-spacing:-.055em}header,.mono{font:500 12px/1.3 Mono,monospace;letter-spacing:.03em}header{display:flex;justify-content:space-between;gap:10px}
img{display:block;width:100%;object-fit:cover}.photo{position:absolute;inset:0;height:100%}

.cover-finder .photo{height:60%;object-position:50% 55%}
.finder-note{position:absolute;background:#fbfaf4;padding:25px 30px;left:0;right:0;bottom:0}
.finder-note h1{margin:15px 0 18px}.search{display:flex;align-items:center;gap:10px;border-bottom:1px solid #9ba99a;padding-bottom:11px;color:#314f43;font-size:17px}
.search i{height:12px;width:12px;border:1.6px solid;border-radius:100%;position:relative}.search i:after{content:'';position:absolute;height:6px;border-left:1.6px solid;transform:rotate(-45deg);top:8px;left:10px}
.wheel-finder .photo{width:39%;object-position:56% 50%}.wheel-finder .finder-note{left:39%;height:100%;padding:20px 19px;display:grid;align-content:center}
.wheel-finder h1{font-size:31px;margin:14px 0 0}.wheel-finder .search{font-size:15px}
.cover-permit,.wheel-permit{color:#503a29;background:#ddc7a4}
.cover-permit{background:linear-gradient(130deg,#b9895f,#dcc49b 67%,#bb906b)}
.paper{position:absolute;inset:30px 27px 31px;background:#fff9eb;box-shadow:2px 6px 1px #715a3430,5px 14px 20px #583c2933;padding:25px}
.paper header{padding-bottom:15px;border-bottom:2px solid #6d604c}.paper .num{font-size:62px;margin:21px 0 4px}
.paper .decision{display:flex;align-items:center;justify-content:space-between;border-block:1px solid #b7ad96;margin:18px 0;padding:10px 0}
.decision strong{color:#275b40}.paper h2{font-size:31px;margin:8px 0 15px}.paper p{line-height:1.45}
.paper .stub{border-top:2px dotted #c2b79f;padding-top:12px;margin-top:17px;font-size:12px}
.wheel-permit .paper{inset:0;box-shadow:none;padding:15px 20px;border-left:7px solid #ac7149}
.wheel-permit .paper header{padding-bottom:8px}.wheel-permit .num{font-size:49px;margin:10px 0 0}
.wheel-permit .decision{margin:9px 0 0;border-bottom:0;padding:8px 0 0}
.cover-ledger,.wheel-ledger{color:#eaf5df;background:#24473d}
.cover-ledger header{border-bottom:1px solid #b3c7a8;padding-bottom:14px}
.ledger{padding:26px}.ledger .num{font-size:94px;margin:13px 0 0}.ledger .num small{font-size:.52em}.ledger p{color:#d7e4d0}
.report{margin-top:24px;padding:21px 20px;color:#243e34;background:#eff3e6}
.bar{display:grid;grid-template-columns:1fr auto;row-gap:5px;margin:13px 0}.bar i{grid-column:span 2;height:7px;background:linear-gradient(to right,#457458 var(--value),#d4dece var(--value))}
.report footer{font:11px Mono,monospace;border-top:1px solid #bccbb9;padding-top:9px;margin-top:18px}
.wheel-ledger .ledger{padding:17px 20px}.wheel-ledger .num{font-size:50px;margin:5px 0 2px}.wheel-ledger .bar{font-size:12px;margin:5px 0;row-gap:2px}
.wheel-ledger .bar i{height:4px;background:linear-gradient(to right,#d8e6ae var(--value),#547063 var(--value))}
.cover-release{background:#242e36;color:#f1f0e7;padding:27px}.cover-release header{padding-bottom:17px;border-bottom:1px solid #738087}
.cover-release h1{font-size:84px;margin:14px 0 5px}.cover-release p{font-size:17px;color:#cdd8d8}
.diff{position:absolute;top:49%;left:26px;right:0;bottom:0;overflow:hidden;border:1px solid #58636d;border-right:0;background:#11171c}
.diff img{width:192%;max-width:none;height:auto;position:relative;left:-32%;margin-top:-24%}.diff .mono{position:relative;z-index:1;background:#151f27}.diff .mono{padding:12px 14px;color:#b9d6c5}
.cover-atlas{background:#f4f1e6}.cover-atlas .photo{height:56%;object-position:center 60%}
.atlas-sheet{position:absolute;inset:53% 0 0;padding:15px 17px 0;background:#f4f1e6}.atlas-sheet header{padding-bottom:9px}.atlas-sheet header span:first-child{font-weight:600}
.atlas-map{width:100%;height:calc(100% - 25px);object-fit:cover;object-position:center}
`;
function art(id, wheel) {
  switch (id) {
    case 'finder':
      return `
        ${img('home-projects/telegraph-pavilion.webp', 'photo')}
        <div class="finder-note">
          <div class="search"><i></i>picnic</div>
          <h1>${esc(catalog.service)}</h1>
          ${wheel ? '' : `<p>${esc(catalog.office)}</p>`}
        </div>`;
    case 'permit': {
      const details = `
        <h2>${esc(field('Event name'))}</h2>
        <p>${esc(field('Event location'))}</p>
        <div class="stub">Event date · ${esc(field('Event date'))}</div>`;
      return `<article class="paper">
        ${top('PERMIT DESK', 'SAMPLE RECEIPT')}
        <div class="num">${caseId}</div><p>Community event permit</p>
        <div class="decision"><strong>${esc(field('Decision'))}</strong>
          <span>Revision ${esc(field('Approved revision'))}</span></div>
        ${wheel ? '' : details}
      </article>`;
    }
    case 'ledger': {
      const report = `<p>Logged staff hours</p>
        <div class="report"><strong>Hours by service</strong>${rules}
          <footer>${catalog.logs.map(row => esc(row.key)).join(' / ')}</footer></div>`;
      return `<div class="ledger">${top('SERVICE LEDGER', 'SOUTH')}
        <div class="num">${hours}<small> h</small></div>${wheel ? rules : report}</div>`;
    }
    case 'release':
      return `${top('KVCACHED / RELEASES', '03 OCT 2026')}
        <h1>v0.1.6</h1><p>Worker socket cleanup</p>
        <div class="diff"><div class="mono">Merged change · #480</div>
          ${img('project-evidence/worker-changes.webp', '')}</div>`;
    case 'atlas':
      return `${img('cgs-atlas/morowali-2560.webp', 'photo')}
        <div class="atlas-sheet">${top('MOROWALI', 'CENTRAL SULAWESI')}
          ${img('editorial/industrial-parks.webp', 'atlas-map')}</div>`;
    default:
      throw new Error('Unknown project ' + id);
  }
}
await mkdir(output,{recursive:true});
const browser = await chromium.launch();
try {
  const base = 'http://artwork.test/';
  for (const wheel of [false,true]) {
    const width = wheel ? 320 : 360;
    const height = wheel ? 174 : 432;
    const page = await browser.newPage({viewport:{width,height},deviceScaleFactor:4});
    // Serve the checked-in sources in-process; the generator needs no network.
    await page.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.origin !== new URL(base).origin) return route.abort();
      if (url.pathname === '/') return route.fulfill({contentType:'text/html', body:'<!doctype html>'});
      return route.fulfill({path:join(root,url.pathname)});
    });
    await page.goto(base);
    for (const id of wheel ? ['finder','permit','ledger'] : ['atlas','permit','ledger','release','finder']) {
      await page.setContent(`<!doctype html><html><head><base href="${base}"><style>${styles}</style></head><body><main class="${wheel?'wheel':'cover'}-${id}">${art(id,wheel)}</main></body></html>`);
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all([...document.images].map(image => image.decode()));
      });
      const frame = await page.screenshot();
      for (const w of wheel ? [480,960,1280] : [640,960,1440]) {
        await sharp(frame).resize(w).webp({quality:89,smartSubsample:true}).toFile(join(output,`${wheel?'wheel':'cover'}-${id}-${w}.webp`));
      }
    }
    await page.close();
  }
} finally { await browser.close(); }
