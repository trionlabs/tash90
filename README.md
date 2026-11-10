# TASH90

Temporary, bilingual landing page for an AI safety and security gathering in Istanbul.

Source repository: `trionlabs/tash90` (public). The files in `public/` are intended to be publicly served. No dates, speakers or sponsors are confirmed by this page.

## Edit the page

- `public/index.html`: structure and Turkish fallback copy.
- `public/site.js`: Turkish and English text, language and colour-mode logic. Keep the Turkish copy consistent with the HTML fallback.
- `public/mosaic.js`: the tile mosaic drawn on the canvases (the Bosphorus hero, the footer strip and the topic emblems), and both colour palettes.
- `public/styles.css`: layout, both colour modes and responsive styles.
- `public/fonts/`: self-hosted Funnel Display, Inter and IBM Plex Mono (Latin and Latin Extended subsets). Their licence, the SIL Open Font License 1.1, is in `public/fonts/OFL.txt`.
- `public/_headers`: hosting response headers.

The site has no application dependencies, analytics, cookies, forms or external fonts. The Turkish page remains readable without JavaScript.

The contact link on the page goes to contact@tash90.org, which Namecheap email forwarding handles (configured at Namecheap, outside this repository). Cloudflare Email Routing is not used; the zone only carries Namecheap's MX and SPF records.

### Language and colour mode

- Language: `?lang=tr` or `?lang=en` wins. Otherwise visitors in the `Europe/Istanbul` time zone or with a Turkish browser get Turkish; everyone else gets English. This is decided in the browser; no location data is sent anywhere.
- Theme: light (turquoise, default) or dark (Byzantine lapis and gold), switched by the mosaic button in the header and kept as `?theme=dark`.
- Both choices live in the URL, not browser storage, so a shared link opens the same way.
- The animation stops for visitors who prefer reduced motion, and the footer has a pause button.

## Preview locally

Run from the repository root:

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory public
```

Open `http://127.0.0.1:4173/`. Stop the server with Ctrl-C.

Check JavaScript syntax with:

```sh
node --check public/site.js
node --check public/mosaic.js
```

## Hosting

Live: https://tash90.org/ (also https://www.tash90.org/ and https://tash90.sparkling-queen-5e77.workers.dev/)

Cloudflare Worker: `tash90` in the Trion Labs Cloudflare account (`f0b938c1641f5223c48199ec45751913`), using Static Assets. Only `public/` is published; no Worker application code runs. The configuration is in `wrangler.jsonc`.

### Publish manually

From the repository root, logged in to (or holding a token for) the Trion Labs Cloudflare account:

```sh
node --check public/site.js
npx --yes wrangler@4.147.0 deploy
```

### Publish from GitHub

Push changes to `main` in the `trionlabs/tash90` repository. The `Deploy website` workflow checks JavaScript syntax and publishes `public/` to Cloudflare. You can also run it manually from the repository's Actions tab.

Automatic deployment was verified on 3 November 2026. Check the latest run at https://github.com/trionlabs/tash90/actions before assuming an edit is live. A failed deployment leaves the previous version online.

The repository secret `CLOUDFLARE_API_TOKEN` contains the Trion account token `tash90-github-deploy` (Workers Scripts Write and Account Settings Read on the Trion Labs account). Cloudflare cannot limit it to a single Worker, so it can edit every Worker in that account. Keep this token out of source files. The workflow does not need the existing organisation-wide Cloudflare GitHub integration.

GitHub Actions minutes are free because the repository is public. While it was private, runs stopped with a billing error before any step ran.

### Domain

`tash90.org` is registered at Namecheap and its DNS zone is in the Trion Labs Cloudflare account, with nameservers:

- `coraline.ns.cloudflare.com`
- `ned.ns.cloudflare.com`

On 10 November 2026 the Worker and zone moved from a personal Cloudflare account (nameservers `newt`/`penny`) to the Trion Labs account. DNSSEC is not enabled.

The zone holds the five Namecheap mail-forwarding MX records, the SPF TXT record, and the two Worker custom domains (`tash90.org`, `www.tash90.org`). Custom domains are managed in Cloudflare, separately from `wrangler.jsonc`.

Keep account credentials, domain-registration contacts, speaker candidates and private planning notes out of this repository. Only `public/` should be published.
