# Ridgefolio

Source for [ridgefolio.com](https://ridgefolio.com). The public website covers engineering services for public agencies and delivery partners. It includes founder project notes, three browser-based demonstrations, a local site search, a capability statement and planning worksheets.

## Develop

Run `npm ci` and `npm run dev`. Edit the descriptions in `site/content.py`, the page layouts in `site/build.py`, and the styles and interactions in `public/assets/`. Run `python3 site/build.py` to render the pages, search index and sitemap. The generated pages are committed, so deployment only serves static files.

The demos use fictional records and hold input in the current tab. The project brief and checklist download as local text files. Contact links open the visitor's mail application or the practice’s Cal.com booking page.

## Update downloadable and visual assets

Run `npx playwright install chromium` and `node scripts/capability-pdf.mjs` after changing the printable capability statement. Its links point to the production domain. To refresh the service-page screenshots, start the development server and run `node scripts/demo-previews.mjs`. Set `RIDGEFOLIO_PREVIEW_ORIGIN` when using another local port.

## Verify and deploy

Run `npm run check`, install the Playwright browsers and run `npm test`. Browser tests cover desktop Chromium, Firefox and WebKit, iPhone and Android emulation, responsive layouts, keyboard controls, the permit correction cycle, data exports and planning tools.

Cloudflare Workers Builds deploys pushes to `main` to `ridgefolio.com`. The build command is `npm run check`, and the deploy command is `npx wrangler deploy`. The repository contains no deployment credentials. Reverting a site change on the production branch triggers a new build. The Cloudflare settings are in `wrangler.jsonc`.

Font license notices are in `public/assets/fonts/`. Founder work is attributed on each project page. The site code, original artwork, branding and portrait carry no open-source license merely by being publicly viewable.

## Public work samples

The homepage opens with one CGS project. A photograph of Morowali sits alongside the working atlas, its regional chart and the park record. Each slide in the engineering section displays its corresponding evidence. Carol M. Highsmith photographed Civic Center Plaza and City Hall. The Library of Congress lists both photographs with no known restrictions on publication. [Plaza photograph](https://www.loc.gov/item/2013630463/) · [City Hall dome photograph](https://www.loc.gov/item/2011630953/)

The CGS case study uses the May 2025 handover dataset with NASA Blue Marble relief and locally hosted Natural Earth geography. The daylight photograph shows Morowali Industrial Park in Central Sulawesi in July 2023. The Indonesian Ministry of Public Works took the photograph. [CGS records](https://github.com/rishabhsinha17/cgs-industrial-parks-dashboard/tree/673480b96b7dbfce3990cc9f72208c87c65b54a9/data) · [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/) · [NASA Blue Marble relief](https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-topography-bathymetry/) · [Morowali photograph and rights](https://commons.wikimedia.org/wiki/File:Morowali_Industrial_Park.jpg)

The homepage handset surrounds a capture of Ridgefolio’s working atlas. Its frame is based on the MIT-licensed iPhone 14 Pro from Devices.css. [Frame source](https://github.com/picturepan2/devices.css/tree/11846244977a4905a4fb9ac12bb2121e068d6147) · [License](public/assets/home-evidence/DEVICE-FRAME-LICENSE.txt)

The service-design images come from the 18F archive. They document a federal team’s meeting, Open Forest field research, prioritization exercise and design method cards. [Workshop](https://github.com/18F/18f.gsa.gov/blob/main/content/posts/2016-12-14-how-to-run-an-efficient-meeting.md) · [Field research](https://github.com/18F/18f.gsa.gov/blob/main/content/posts/2020-02-06-even-with-a-design-system-you-still-need-a-designer.md) · [Prioritization](https://github.com/18F/18f.gsa.gov/blob/main/content/posts/2018-02-06-getting-partners-on-board-with-research-findings.md) · [Method cards](https://github.com/18F/18f.gsa.gov/blob/main/content/posts/2015-08-10-18f-design-methods.md)

The research images reproduce details of pages 1 and 3 of Rishabh Sinha’s preprint. The release exhibit links directly to the two merged changes and their published release. [Paper](https://arxiv.org/abs/2610.37679) · [Release notes](https://github.com/ovg-project/kvcached/releases/tag/v0.1.6)

The sample permit receipt in `public/downloads/` was exported from the working demonstration using the walkthrough in the example project brief.

The industrial parks project card uses a September 2019 ASTER satellite view of southeast Sulawesi. Credit: NASA/METI/AIST/Japan Space Systems, and U.S./Japan ASTER Science Team. [NASA Photojournal, PIA26007](https://science.nasa.gov/photojournal/sulawesi-indonesia/)

### Interior documentary art

The public website and workflow services use Carol M. Highsmith’s photographs of the public workstations at Baltimore’s Patterson Park library and the Old Town Farmers’ Market in Alexandria. The agency page shows the Route 9 Library and Innovation Center in Delaware. Each photograph links to its Library of Congress record. [Patterson Park library](https://www.loc.gov/item/2012630164/) · [Old Town market](https://www.loc.gov/item/2020724970/) · [Route 9 Library](https://www.loc.gov/item/2018699890/)

The service finder’s gallery photograph shows a Market Street information kiosk in San Francisco, also photographed by Highsmith. [Market Street kiosk](https://www.loc.gov/item/2011633078/)

The buyer resources show Ridgefolio’s project brief, marked launch checklist and capability statement. Demo previews come from the local tools with fictional service records. The permit example follows case RF-101 from a staff request for a more precise location through the corrected approval receipt.

The partner and open-source pages show the public GitHub review for the worker cleanup contribution in its light theme. The one-page capability statement, sample permit receipt, project brief and checked worksheet use Ridgefolio’s own artifacts. [kvcached cleanup review](https://github.com/ovg-project/kvcached/pull/480/files) · [IBM vLLM Hook risk analyzer review](https://github.com/IBM/vLLM-Hook/pull/41)
