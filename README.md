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

The angled screens on the homepage show Ridgefolio's demonstrations, founder projects and research figures. Carol M. Highsmith photographed Civic Center Plaza and City Hall. The Library of Congress lists both photographs with no known restrictions on publication. [Plaza photograph](https://www.loc.gov/item/2013630463/) · [City Hall dome photograph](https://www.loc.gov/item/2011630953/)

The case study’s map plots the May 2025 CGS snapshot over Natural Earth geography. Its local data file contains only the 141 park names, statuses and coordinates, rounded to five decimals for display. Both the static map and interactive map use the same projection. Usage counts and chart values are dated snapshots. [Status GeoJSON](https://github.com/rishabhsinha17/cgs-industrial-parks-dashboard/blob/673480b96b7dbfce3990cc9f72208c87c65b54a9/data/geojson/statusGeojsonData.geojson) · [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/)

The research images reproduce details of pages 1 and 3 of Rishabh Sinha’s preprint. The release exhibit links directly to the two merged changes and their published release. [Paper](https://arxiv.org/abs/2610.37679) · [Release notes](https://github.com/ovg-project/kvcached/releases/tag/v0.1.6)

The sample permit receipt in `public/downloads/` was exported from the working demonstration using the walkthrough in the example project brief.

The project records section uses astronaut photograph ISS056-E-6994, acquired from the International Space Station. It shows Java at night. The skyline and City Hall photographs were downsampled from the Library of Congress archival masters. [NASA Earth Observatory](https://science.nasa.gov/earth/earth-observatory/lights-of-java-92666/) · [San Francisco Civic Center](https://www.loc.gov/item/2013630463/) · [City Hall dome](https://www.loc.gov/item/2011630953/)

The industrial parks project card uses a September 2019 ASTER satellite view of southeast Sulawesi. Credit: NASA/METI/AIST/Japan Space Systems, and U.S./Japan ASTER Science Team. [NASA Photojournal, PIA26007](https://science.nasa.gov/photojournal/sulawesi-indonesia/)
