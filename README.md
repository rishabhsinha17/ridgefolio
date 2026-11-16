# Ridgefolio

Source for [ridgefolio.com](https://ridgefolio.com), an independent software engineering practice serving public agencies and delivery partners.

A static HTML, CSS and JavaScript site with self-hosted fonts, inline SVG icons and an original interactive canvas graphic. No framework or runtime CDN is required. Contact forms prepare a message in the visitor's own mail app; they do not store or send submissions to a server.

## Develop

```sh
npm ci
npm run dev
```

Edit `public/index.html`, `public/assets/civic.css` and `public/assets/civic.js` directly. The `public/` directory is the complete deployable site. No private source checkout is required.

## Verify

```sh
npm run check
npx playwright install --with-deps chromium firefox webkit
npm test
```

The GitHub Actions workflow runs asset checks and browser tests for desktop Chromium, Firefox and WebKit, plus iPhone-style WebKit and Android-style Chromium emulation. It checks 320–1440px layouts, landscape dialogs, fonts, image and canvas rendering, navigation, keyboard tabs, the sample workflow and reduced motion. Test reports include screenshots. Emulation does not replace checks on physical iOS and Android devices, and browser font antialiasing can differ slightly.

## Deploy

Cloudflare Worker: `ridgefolio`. Production branch: `main`.

The repository is intended for Cloudflare Workers Builds with:

- Root directory: `/`
- Build command: `npm run check`
- Deploy command: `npx wrangler deploy`
- Production branch: `main`

The static assets are configured in `wrangler.jsonc`. Domain bindings are `ridgefolio.com` and `www.ridgefolio.com`. Cloudflare zone settings handle HTTPS and the canonical www redirect. The GitHub workflow reports browser compatibility separately from Cloudflare's deployment check.

Manual deployment, if needed, uses `npm run deploy` after authenticating with Cloudflare. Do not commit credentials. Static asset delivery uses Cloudflare's free tier; domain registration and renewal are separate. Adding server-side services could change costs.

## Assets

Font license notices are included under `public/assets/fonts/`. Founder contributions are presented as individual experience, separate from Ridgefolio client engagements. The site code, branding, original graphics and portrait are not granted an open-source license merely by being publicly viewable.
