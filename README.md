# Ridgefolio

Source for [ridgefolio.com](https://ridgefolio.com), an independent software engineering practice serving public agencies and delivery partners.

A static HTML, CSS and JavaScript site with self-hosted fonts, inline SVG icons and the selected computational ridge graphic. No framework or runtime CDN is required. Call-to-action links open the Ridgefolio booking page at https://cal.com/ridgefolio/intro. The email option opens the visitor's mail app addressed to rishabh@ridgefolio.com; this site does not collect form submissions.

## Develop

```sh
npm ci
npm run dev
```

Edit `public/index.html`, `public/assets/civic.css` and `public/assets/civic.js` directly. The hero graphic lives in `public/assets/ridge.css` and `public/assets/ridge.js`. The `public/` directory is the complete deployable site. No private source checkout is required.

## Verify

```sh
npm run check
npx playwright install --with-deps chromium firefox webkit
npm test
```

The GitHub Actions workflow runs asset checks and browser tests for desktop Chromium, Firefox and WebKit, plus iPhone-style WebKit and Android-style Chromium emulation. It checks 320–1440px layouts, landscape screens, fonts, image and canvas rendering, surface/wireframe controls, navigation, keyboard dismissal, contact destinations, the not-found page and reduced motion. Test reports include screenshots. Emulation does not replace checks on physical iOS and Android devices, and browser font antialiasing can differ slightly.

## Deploy

Cloudflare Worker: `ridgefolio`. Production branch: `main`.

The repository is connected to Cloudflare Workers Builds. Pushes to `main` automatically deploy to [ridgefolio.com](https://ridgefolio.com) with:

- Root directory: `/`
- Build command: `npm run check`
- Deploy command: `npx wrangler deploy`
- Production branch: `main`

Preview builds are disabled. The deployment uses the account's existing Workers Builds authorization; no deployment credentials are stored in this repository. Build status appears as the `Workers Builds: ridgefolio` check on GitHub commits.

The static assets are configured in `wrangler.jsonc`. Domain bindings are `ridgefolio.com` and `www.ridgefolio.com`. Cloudflare zone settings handle HTTPS and the canonical www redirect. The GitHub workflow reports browser compatibility separately from Cloudflare's deployment check.

Manual deployment, if needed, uses `npm run deploy` after authenticating with Cloudflare. Do not commit credentials. Static asset delivery uses Cloudflare's free tier; domain registration and renewal are separate. Adding server-side services could change costs.

## Assets

Font license notices are included under `public/assets/fonts/`. The computational ridge is rendered locally in Canvas 2D. It responds to pointer movement, supports surface and wireframe views, and remains static when reduced motion is requested. Founder contributions are presented as individual experience, separate from Ridgefolio client engagements. The site code, branding, original graphics and portrait are not granted an open-source license merely by being publicly viewable.
