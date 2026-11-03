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

### GitHub deployment status

Source changes are stored in the private `trionlabs/tash90` repository. Automatic deployment is **not yet enabled**. The existing organisation-wide Cloudflare GitHub installation could not be linked to this account. A GitHub Actions workflow has been prepared locally; enabling it awaits authorisation to create a deployment token restricted to the `tash90` Worker and store it as the repository secret `CLOUDFLARE_API_TOKEN`.

Until automatic deployment has been enabled and tested, pushing to `main` does not publish the website. Use the manual command above.

### Domain status

Target domain: https://tash90.org/

The apex domain is attached to the Worker in Cloudflare. As of 3 November 2026, its zone is pending because Namecheap still delegates to its original nameservers. The required Cloudflare nameservers are:

- `newt.ns.cloudflare.com`
- `penny.ns.cloudflare.com`

The imported five mail-forwarding MX records and SPF TXT record have been preserved. The default apex parking record was replaced. The `www` parking CNAME still needs replacing and attaching to this Worker. Domain HTTPS and public DNS must be checked after activation; the temporary URL is already live.

Custom domains are managed in Cloudflare, separately from `wrangler.jsonc`.

Keep account credentials, domain-registration contacts, speaker candidates and private planning notes out of this repository. Only `public/` should be published.
