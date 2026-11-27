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
from content import CHECKS
from finder import SERVICES
from service_ledger import RECORDS
entry = next(s for s in SERVICES if s.slug == 'park-shelter-reservation')
rows = [r for r in RECORDS if r.district == 'South']
print(json.dumps(dict(checks=[title for title, _ in CHECKS], service=entry.name, office=entry.desk,
    logs=[dict(key=r.key, service=r.service, hours=r.minutes/60) for r in rows])))
`], {encoding:'utf8'}));
const brief = await readFile('public/downloads/permit-desk-project-brief.txt', 'utf8');
const sections = new Map(brief.trim().split(/\n\n/).map(block => {
  const [heading, ...lines] = block.split('\n');
  return [heading, lines.join(' ')];
}));
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
.cover-permit{color:#503a29;background:#ddc7a4}
.cover-permit{background:linear-gradient(130deg,#b9895f,#dcc49b 67%,#bb906b)}
.paper{position:absolute;inset:30px 27px 31px;background:#fff9eb;box-shadow:2px 6px 1px #715a3430,5px 14px 20px #583c2933;padding:25px}
.paper header{padding-bottom:15px;border-bottom:2px solid #6d604c}.paper .num{font-size:62px;margin:21px 0 4px}
.paper .decision{display:flex;align-items:center;justify-content:space-between;border-block:1px solid #b7ad96;margin:18px 0;padding:10px 0}
.decision strong{color:#275b40}.paper h2{font-size:31px;margin:8px 0 15px}.paper p{line-height:1.45}
.paper .stub{border-top:2px dotted #c2b79f;padding-top:12px;margin-top:17px;font-size:12px}
.cover-ledger{color:#eaf5df;background:#24473d}
.cover-ledger header{border-bottom:1px solid #b3c7a8;padding-bottom:14px}
.ledger{padding:26px}.ledger .num{font-size:94px;margin:13px 0 0}.ledger .num small{font-size:.52em}.ledger p{color:#d7e4d0}
.report{margin-top:24px;padding:21px 20px;color:#243e34;background:#eff3e6}
.bar{display:grid;grid-template-columns:1fr auto;row-gap:5px;margin:13px 0}.bar i{grid-column:span 2;height:7px;background:linear-gradient(to right,#457458 var(--value),#d4dece var(--value))}
.report footer{font:11px Mono,monospace;border-top:1px solid #bccbb9;padding-top:9px;margin-top:18px}
.cover-release{background:#242e36;color:#f1f0e7;padding:27px}.cover-release header{padding-bottom:17px;border-bottom:1px solid #738087}
.cover-release h1{font-size:84px;margin:14px 0 5px}.cover-release p{font-size:17px;color:#cdd8d8}
.diff{position:absolute;top:49%;left:26px;right:0;bottom:0;overflow:hidden;border:1px solid #58636d;border-right:0;background:#11171c}
.diff img{width:192%;max-width:none;height:auto;position:relative;left:-32%;margin-top:-24%}.diff .mono{position:relative;z-index:1;background:#151f27}.diff .mono{padding:12px 14px;color:#b9d6c5}
.cover-atlas{background:#f4f1e6}.cover-atlas .photo{height:56%;object-position:center 60%}
.atlas-sheet{position:absolute;inset:53% 0 0;padding:15px 17px 0;background:#f4f1e6}.atlas-sheet header{padding-bottom:9px}.atlas-sheet header span:first-child{font-weight:600}
.atlas-map{width:100%;height:calc(100% - 25px);object-fit:cover;object-position:center}
/* Buyer covers are excerpts from the planning documents shown on the destination pages. */
.brief-sheet {margin:26px 22px;padding:20px 23px 22px;background:#fffaf0;border-top:4px solid #a2653e;
  box-shadow:1px 5px 12px #593f2223}
.cover-brief {background:#dbc9ac}
.brief-sheet header,.estimate-sheet header {border-bottom:1px solid #b1a28a;padding-bottom:13px}
.brief-sheet h1 {font-size:40px;margin:18px 0 16px;color:#483d2d}
.brief-sheet h2 {font:650 17px Sans,sans-serif;letter-spacing:0;border-top:1px solid #cfc3ac;padding:12px 0 6px}
.brief-sheet p {font-size:16px;line-height:1.46;color:#544c3b}
.cover-checklist {padding:25px 24px;background:#eef2e6}
.cover-checklist header {border-bottom:1px solid #98a98e;padding-bottom:12px}
.cover-checklist h1 {font-size:37px;margin:15px 0 13px}
.cover-checklist ul {list-style:none;padding:0;margin:0}
.cover-checklist li {min-height:41px;display:flex;align-items:center;gap:11px;border-top:1px solid #bdcbb6;font-size:16px;line-height:1.24}
.cover-checklist li i {width:16px;height:16px;flex:none;border:1.5px solid #849789;background:#fafbf6;position:relative}
.cover-checklist li.checked i {background:#315744;border-color:#315744}
.cover-checklist li.checked i::after {content:'';position:absolute;left:4px;top:1px;width:4px;height:8px;border:solid white;border-width:0 2px 2px 0;transform:rotate(40deg)}
.cover-checklist footer {margin-top:9px}
.cover-capability {color:#eff4ea;background:#28423b;padding:25px 24px}
.cover-capability header {border-bottom:1px solid #889a8e;padding-bottom:11px}
.cover-capability h1 {font-size:42px;margin:17px 0 12px}
.cap-document {position:relative;width:100%;height:286px;overflow:hidden;background:white;box-shadow:0 4px 8px #12292240}
.cap-document img {width:119%;max-width:none;margin-left:-6%;margin-top:-5%}
.cover-scope {background:#253644;color:#edf2f1}
.estimate-sheet {padding:26px 25px}
.estimate-sheet header {border-color:#788a92}
.estimate-sheet h1 {font-size:41px;max-width:245px;margin:17px 0 22px}
.estimate-row {border-top:1px solid #7c8b91;padding:12px 0}
.estimate-row b {display:block;font-size:18px;letter-spacing:-.02em}
.estimate-row span {display:block;color:#d1dce0;margin-top:3px;font-size:14px}

`;
function art(id) {
  switch (id) {
    case 'finder':
      return `
        ${img('home-projects/telegraph-pavilion.webp', 'photo')}
        <div class="finder-note">
          <div class="search"><i></i>picnic</div>
          <h1>${esc(catalog.service)}</h1>
          <p>${esc(catalog.office)}</p>
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
        ${details}
      </article>`;
    }
    case 'ledger': {
      const report = `<p>Logged staff hours</p>
        <div class="report"><strong>Hours by service</strong>${rules}
          <footer>${catalog.logs.map(row => esc(row.key)).join(' / ')}</footer></div>`;
      return `<div class="ledger">${top('SERVICE LEDGER', 'SOUTH')}
        <div class="num">${hours}<small> h</small></div>${report}</div>`;
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
    case 'brief': {
      const subject = sections.get('RIDGEFOLIO | EXAMPLE PROJECT BRIEF');
      const result = sections.get('Desired result');
      if (!subject || !result) throw new Error('Missing worked brief excerpt');
      return `<article class="brief-sheet">${top('PROJECT BRIEF', 'EXAMPLE')}
        <h1>${esc(subject)}</h1><h2>Desired result</h2><p>${esc(result)}</p></article>`;
    }
    case 'checklist': {
      // Same three completed rows as the example worksheet on the Resources page.
      const checked = new Set(['Content and redirects', 'Keyboard and assistive technology', 'Cutover and recovery']);
      const rows = catalog.checks.map(title =>
        `<li class="${checked.has(title) ? 'checked' : ''}"><i></i>${esc(title)}</li>`).join('');
      return `${top('LAUNCH WORKSHEET', 'EXAMPLE')}<h1>Launch readiness</h1>
        <ul>${rows}</ul><footer class="mono">${checked.size} of ${catalog.checks.length} checked</footer>`;
    }
    case 'capability':
      return `${top('RIDGEFOLIO LLC', 'ONE-PAGE PDF')}<h1>Capability statement</h1>
        <div class="cap-document">${img('article-evidence/capability-sheet.webp', '')}</div>`;
    case 'scope':
      return `<div class="estimate-sheet">${top('SCOPE &amp; PRICING', 'RIDGEFOLIO')}
        <h1>Ways to buy the work</h1>
        <div class="estimate-row"><b>Discovery and prototype</b><span>One user journey and a working example</span></div>
        <div class="estimate-row"><b>Implementation</b><span>Agreed deliverables priced by milestone</span></div>
        <div class="estimate-row"><b>Ongoing support</b><span>Coverage window and response targets</span></div></div>`;
    default:
      throw new Error('Unknown project ' + id);
  }
}
// Keep the detailed sheets on the carousels. Each circular crop on the wheel
// has one legible subject, taken from those same sources.
const roundStyles = `
main{display:grid;place-content:center;text-align:center;gap:4px;padding:24px}
main strong{font:400 36px/1.07 Serif,Georgia,serif;letter-spacing:-.05em}
main small{font:650 11px/1.35 Sans,sans-serif}main .bar{width:112px;text-align:left;font:600 11px/1.15 Sans,sans-serif}
.round-permit{background:#f1e2c8;color:#553e2e}.round-permit small:last-child{color:#355f41;border-top:1px solid #a69575;padding-top:5px}
.round-hours{background:#24473d;color:#f2f3df}.round-hours strong{font-size:52px}
.round-search{background:#e8eede;color:#243d31}.round-search strong{font-style:italic}
.round-report{background:#dce5d4;color:#263e32}.round-report .bar{margin:4px 0}
`;
const rounds = {
  pavilion:img('home-projects/telegraph-pavilion.webp','photo'),
  market:img('interior-art/public-market-1536.webp','photo'),
  permit:`<small>Permit desk</small><strong>${caseId}</strong><small>${esc(field('Decision'))}</small>`,
  hours:`<small>South district</small><strong>${hours} h</strong><small>Service ledger</small>`,
  search:`<small>Service finder</small><strong>picnic</strong><small>${esc(catalog.service)}</small>`,
  report:rules
};
await mkdir(output,{recursive:true});
const browser = await chromium.launch();
try {
  const base = 'http://artwork.test/';
  const resources = process.argv.includes('--resources');
  for (const round of resources ? [false] : process.argv.includes('--rounds') ? [true] : [false,true]) {
    const width = round ? 180 : 360;
    const height = round ? 180 : 432;
    const page = await browser.newPage({viewport:{width,height},deviceScaleFactor:4});
    // Serve the checked-in sources in-process; the generator needs no network.
    await page.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.origin !== new URL(base).origin) return route.abort();
      if (url.pathname === '/') return route.fulfill({contentType:'text/html', body:'<!doctype html>'});
      return route.fulfill({path:join(root,url.pathname)});
    });
    await page.goto(base);
    const ids = resources ? ['brief','checklist','capability','scope']
      : round ? Object.keys(rounds) : ['atlas','permit','ledger','release','finder'];
    for (const id of ids) {
      await page.setContent(`<!doctype html><html><head><base href="${base}"><style>${styles}${round?roundStyles:''}</style></head><body><main class="${round?'round':'cover'}-${id}">${round?rounds[id]:art(id)}</main></body></html>`);
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all([...document.images].map(image => image.decode()));
      });
      const frame = await page.screenshot();
      for (const w of round ? [720] : [640,960,1440]) {
        await sharp(frame).resize(w).webp({quality:89,smartSubsample:true}).toFile(join(output,round ? `round-${id}.webp` : `cover-${id}-${w}.webp`));
      }
    }
    await page.close();
  }
} finally { await browser.close(); }
