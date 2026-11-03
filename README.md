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

Target domain: `https://tash90.org/`.

The intended Cloudflare Pages configuration is:

- Production branch: `main`
- Framework preset: None
- Build command: empty
- Output directory: `public`

Deployment and domain connection are being configured. This section will be updated with the verified setup.

Keep account credentials, domain-registration contacts, speaker candidates and private planning notes out of this repository. Only `public/` should be published.
