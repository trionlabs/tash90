# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static, bilingual (Turkish/English) landing page for TASH90, an AI safety gathering in Istanbul. Plain HTML/CSS/ES modules in `public/`, no build step, no package.json, no dependencies. Served by a Cloudflare Worker using Static Assets (`wrangler.jsonc`); no Worker code runs. Only `public/` is published. The Worker and the `tash90.org` zone live in the **Trion Labs** Cloudflare account (`f0b938c1…`), not a personal account; the domain is registered at Namecheap. `contact@tash90.org` uses Namecheap email forwarding (MX/SPF records in the Cloudflare zone), not Cloudflare Email Routing.

The page must not claim confirmed dates, speakers or sponsors. Keep credentials, registrar contacts, speaker candidates and private planning notes out of the repo.

## Commands

```sh
# Local preview (from repo root), then open http://127.0.0.1:4173/
python3 -m http.server 4173 --bind 127.0.0.1 --directory public

# Syntax check (there are no tests or linters)
node --check public/site.js
node --check public/mosaic.js

# Manual deploy (needs a login/token for the Trion Labs Cloudflare account)
npx --yes wrangler@4.147.0 deploy
```

Pushing to `main` triggers `.github/workflows/deploy.yml`, which runs `node --check public/site.js` (not `mosaic.js`) and deploys with the `CLOUDFLARE_API_TOKEN` secret. Check https://github.com/trionlabs/tash90/actions before assuming a change is live; a failed deploy leaves the previous version up. Custom domains (`tash90.org`, `www`) are configured in Cloudflare, not in `wrangler.jsonc`.

## Architecture

- `public/index.html` — markup plus the **Turkish fallback copy**, so the page reads correctly without JS. Elements carry `data-copy="<key>"` (text) or `data-label="<key>"` (aria-label) that JS fills in.
- `public/site.js` — ES module entry. Holds the `copy.tr` / `copy.en` dictionaries, picks the language (`?lang=` → `Europe/Istanbul` time zone or Turkish browser → `tr`, else `en`) and theme (`?theme=dark`, default light), swaps text, and mounts every `canvas[data-art]` via `mountMosaic`. Choices are persisted only in the URL (`history.replaceState`), never in storage. Theme switch remounts all canvases.
- `public/mosaic.js` — exports `mountMosaic(canvas, kind, opts)` (the header comment calling it a "classic script" is stale; it is imported as a module). Draws tile mosaics on canvases: `kind` is `hero` (Bosphorus scene on a 240-column grid with ferries, landmarks, lights), `strip` (footer) or `emblem` (11×11 glyph from `M_ICON`, chosen by `data-glyph`). Palettes are in `M_PAL.light` / `M_PAL.dark`. Returns a stop function with a `.hold(paused)` method; honours `prefers-reduced-motion`, page visibility and resize.
- `public/styles.css` — self-hosted `@font-face`s, colour tokens under `[data-theme="light"]` / `[data-theme="dark"]`, layout and responsive rules.
- `public/404.html` — static, no JS, bilingual by hand; used via `not_found_handling: "404-page"`.
- `public/_headers` — strict CSP: `default-src 'none'` with only `'self'` for scripts, styles, images and fonts.

## Invariants to keep in sync

- **Copy keys**: every `data-copy` / `data-label` value in `index.html` must exist in both `copy.tr` and `copy.en`; the Turkish strings in `site.js` must match the HTML fallback. (`pause` is special-cased to toggle with `play`.)
- **Colours are duplicated by hand** across `styles.css` tokens, `M_PAL` in `mosaic.js`, `BRAND` in `site.js`, and `<meta name="theme-color">` in `index.html` and `404.html`. Change them together.
- **CSP**: no inline `<script>`, no `style="…"` attributes or inline `<style>`, no external fonts/CDNs/analytics. Any new asset must be self-hosted under `public/`.
- **Accessibility**: the footer pause button (WCAG 2.2.2) and reduced-motion handling must keep working; the pause button is hidden when reduced motion is on.
- Controls that need JS (`.switch`, `.theme`, `.pause`) ship with `hidden` and are revealed by `site.js`.
