# TASH90

Temporary, bilingual landing page for an AI safety and security gathering in Istanbul.

Private source repository: `trionlabs/tash90`. The files in `public/` are intended to be publicly served. No dates, speakers or sponsors are confirmed by this page.

## Edit the page

- `public/index.html`: structure and Turkish fallback copy.
- `public/site.js`: Turkish and English text. Keep the Turkish copy consistent with the HTML fallback.
- `public/styles.css`: layout, colours and responsive styles.
- `public/_headers`: hosting response headers.

The site has no application dependencies, analytics, cookies, forms or external fonts. Language selection uses the URL (`?lang=en`), not browser storage. The Turkish page remains readable without JavaScript.

## Preview locally

Run from the repository root:

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory public
```

Open `http://127.0.0.1:4173/`. Stop the server with Ctrl-C.

Check JavaScript syntax with:

```sh
node --check public/site.js
```

## Hosting

Live temporary URL: https://tash90.0x471.workers.dev/

Cloudflare Worker: `tash90`, using Static Assets. Only `public/` is published; no Worker application code runs. The configuration is in `wrangler.jsonc`.

### Publish manually

From the repository root, with an authorised Cloudflare login:

```sh
node --check public/site.js
npx --yes wrangler@4.147.0 deploy
```

### Publish from GitHub

Push changes to `main` in the private `trionlabs/tash90` repository. The `Deploy website` workflow checks JavaScript syntax and publishes `public/` to Cloudflare. You can also run it manually from the repository's Actions tab.

Automatic deployment was verified on 3 November 2026. Check the latest run at https://github.com/trionlabs/tash90/actions before assuming an edit is live. A failed deployment leaves the previous version online.

The repository secret `CLOUDFLARE_API_TOKEN` contains an `Individual Workers Editor` token restricted to the `tash90` Worker. Keep this token out of source files. The workflow does not need the existing organisation-wide Cloudflare GitHub integration.

### Domain status

Target domain: https://tash90.org/

Both `tash90.org` and `www.tash90.org` are attached to the Worker. On 3 November 2026, these nameservers were saved at Namecheap and verified after reloading the registrar settings:

- `newt.ns.cloudflare.com`
- `penny.ns.cloudflare.com`

Cloudflare activation has been requested. At the last check, public DNS still returned the former Namecheap nameservers, so custom-domain HTTPS is not yet verified. The temporary Workers URL remains live while delegation propagates.

The five imported mail-forwarding MX records and SPF TXT record have been preserved. Both default parking records were replaced with Worker custom domains.

Custom domains are managed in Cloudflare, separately from `wrangler.jsonc`.

Keep account credentials, domain-registration contacts, speaker candidates and private planning notes out of this repository. Only `public/` should be published.
