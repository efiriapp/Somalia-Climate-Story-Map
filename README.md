# Somalia-Climate-Story-Map

Public climate story map for Somalia, built for the Institute of Climate and Environment (ICE) at SIMAD University. Stories, research and climate impact pages in English, Somali and Arabic, with Leaflet story maps and a MapLibre "ICE at Global Stage" globe.

## Run locally

Requires Node 22 or newer (`.nvmrc` pins 24).

```bash
npm install
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm test` | Unit, content and rendering tests (Vitest) |
| `npm run build` | Typecheck, then build the static site into `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run images:optimize` | Shrink oversized photos in `public/images` in place |
| `npm run images:check` | List photos over the 500 KB budget |

CI (`.github/workflows/ci.yml`) runs the tests and the build on every push to `main` and on pull requests.

## Links and languages

Every page has its own address, so links can be shared and the browser Back button works:

- `#/en/stories`, `#/so/research`, `#/ar/about`
- `#/en/stories/<story-id>` for one story
- `#/en/climate-impact/floods` for one hazard (`floods`, `droughts`, `heat-waves`, `el-nino`, `la-nina`)

The first part is the language (`en`, `so`, `ar`). The last language a visitor chose is remembered in the browser.

Hash addresses work on any static host (GitHub Pages, Netlify, Cloudflare Pages, a plain web server) without rewrite rules.

## Content

- English stories: `src/content/stories.ts` and `src/content/research-stories.ts`
- Somali and Arabic translations: `src/content/so/` and `src/content/ar/`, keyed by story id
- Interface labels in all three languages: `src/application/locale.ts`

`src/content/translation-parity.test.ts` fails if a story or label is added in English without its Somali and Arabic versions, or if a translation is left behind for a story that was removed.

Run `npm run images:optimize` after adding photos.

## Maps

All map sources are free, need no account or API key, and allow public use:

| Layer | Source | Licence |
| --- | --- | --- |
| Streets | [OpenFreeMap](https://openfreemap.org) vector tiles (OpenStreetMap data) | ODbL, credit shown on the map |
| Satellite | EOX Sentinel-2 cloudless **2016** | CC BY 4.0 (later years are non-commercial, so they are not used) |
| Terrain | Streets + hillshade from AWS Terrain Tiles (Mapzen/Tilezen) | Open data, credit shown on the map |

Browsers without WebGL2 fall back to plain OpenStreetMap image tiles. Sources can be changed with `VITE_*` settings (see `.env.example` and `src/application/tile-sources.ts`). Fonts (Inter, Noto Sans Arabic) and flags are bundled, so the site loads nothing from Google or flag servers.

## Media citations

Every page ends with a **Media sources** list, and each video has a citation directly under it.

- Photos follow **TASL** (Title, Author, Source, Licence), the format Creative Commons recommends.
- Videos follow **APA 7th edition**: Channel. (Year, Month Day). *Title* [Video]. Platform. URL

| Media | Where the source comes from | Update with |
| --- | --- | --- |
| Research photos (Wikimedia Commons) | Wikimedia Commons API: author, licence, file page | `npm run credits:fetch` |
| YouTube videos | YouTube oEmbed and the public watch page: channel, date, title | `npm run videos:fetch` |
| Climate Impact photos, Facebook videos, Global Stage photographers | Kept by hand in `src/content/media-sources.ts`, from photo metadata and ICE's files | Edit the file |
| ICE story and Global Stage photos | ICE Institute and the ICE article they appeared in | Automatic |

`npm run media:report` lists every photo or video that still needs permission from its owner or a confirmed source. Only record facts that can be checked; never guess a photographer or licence. The image optimizer keeps each photo's embedded metadata, because it records who owns the photo.

## Deploying to Hostinger

The build writes everything Hostinger needs into `dist/`, including `.htaccess` (caching, file types, security headers from `deploy/headers.mjs`) and `robots.txt`. The site must sit at the root of a domain or subdomain (`public_html`), not in a subfolder.

**Automatic (GitHub Actions):** `.github/workflows/deploy.yml` tests, builds and uploads over FTPS on every push to `main`. In GitHub, go to Settings > Secrets and variables > Actions and add:

- Secrets `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD` (from hPanel > Files > FTP Accounts)
- Variable `SITE_URL`, e.g. `https://storymap.example.org`, once the domain is ready
- Optional variable `FTP_SERVER_DIR` (default `public_html/`)

**Manual:** `npm run package` builds `site-upload.zip`. In hPanel File Manager, open `public_html`, upload it and choose Extract.

After the first upload, turn on SSL in hPanel and enable Force HTTPS.

`npm run preview` serves the built site with the same security headers as the live server, so blocked resources show up in the browser console before upload.

Design spec: [docs/superpowers/specs/2026-08-16-somalia-climate-story-map-design.md](docs/superpowers/specs/2026-08-16-somalia-climate-story-map-design.md)
