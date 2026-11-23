# Hosting guide (for whoever deploys the site)

This is a **static website**: plain HTML, CSS and JavaScript. There is no backend, no database, no build step, no npm, no PHP.
Fonts are bundled, so it makes no calls to Google or any CDN and works on an intranet too.

## What to upload

Upload the **entire contents of this folder** (keep the structure):

```
index.html          <- the page
css/styles.css
js/config.js        <- editable content (logos, links, teams, contact)
js/main.js
assets/fonts/       <- bundled fonts
assets/logos/       <- logos go here
assets/people/      <- optional profile photos go here
```

`HOSTING.md` and `HOW-TO-UPDATE.md` are notes and don't need to be uploaded.

All paths are **relative**, so the site works at the domain root (`https://example.org/`) or inside a sub-folder (`https://example.org/tribal-youth/`) without changes.

## Quick ways to host

| Where | How |
|---|---|
| **Institute / department web server (Apache, Nginx, IIS)** | Copy the folder into the web root (e.g. `/var/www/html/tribal-youth/`). `index.html` is served automatically. No server configuration needed. |
| **GitHub Pages** | Push the folder to a repo, then Settings > Pages > Deploy from branch > `main` / root. |
| **Netlify / Cloudflare Pages / Vercel** | Drag and drop the folder in their dashboard (or connect the repo). Build command: *none*. Publish directory: the folder root. |
| **Any shared hosting (cPanel)** | File Manager > `public_html` > upload and extract the zip. |

## Optional but recommended

- Serve over **HTTPS**. Most hosts above do this automatically.
- Enable gzip/brotli compression if your server allows it (the page is about 150 KB uncompressed apart from fonts).
- Caching: `assets/fonts/` can be cached for a long time. `js/config.js` changes whenever content is updated, so give it a short cache or add `?v=2` to its `<script>` tag in `index.html` after edits.

## Checking it works

Open the site and confirm:
1. The terracotta hero loads with the title in a condensed bold font (fonts loaded).
2. The map in the hero animates and the team list on the left is clickable.
3. No errors in the browser console (F12).

If the page looks unstyled, the `css/` folder was not uploaded or its relative path was broken.

## Updating later

Only `js/config.js` (plus files dropped into `assets/logos/` and `assets/people/`) normally needs to change. See `HOW-TO-UPDATE.md`.
