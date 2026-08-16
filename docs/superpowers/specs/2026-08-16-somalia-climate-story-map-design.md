# Somalia Climate Story Map — Design Spec

**Date:** 2026-08-16  
**Product:** ICE Institute Climate Story Map (v1)  
**Owner:** Institute of Climate and Environment (ICE), SIMAD University  
**Status:** Draft for user review  

This is Somalia’s first ICE-branded climate story map: a public web platform that lets visitors discover ICE climate stories and ICE-at-global-stage moments on a map and in a list, using shared filters.

---

## 1. Goal

A visitor opens one page, sees Somalia, and can filter ICE content by keyword, content type, theme, date, and SDG. Choosing **Global Stage** zooms the map from Somalia to the world. Clicking a pin or a card opens that item’s story.

v1 is a static, free, open-source frontend. Editors will not add stories in the app. New items are added by updating `stories.json` in a later content pass.

---

## 2. Out of scope (v1)

- CMS / admin / login
- Somali language UI
- Backend, database, PostGIS
- Paid map tiles or Mapbox
- Region filter and sort dropdown
- Full ICE institutional website (About, publications, donate)
- Scrollytelling climate-shock chapters from the older HTML prototype
- User accounts, comments, analytics dashboards

---

## 3. Users and success

**Primary user:** public visitor (student, journalist, partner, donor).

**Success for v1:**

1. Header reads as ICE Institute, not IOM: SIMAD crest left, filters center, ICE lockup right.
2. Default view is Somalia with the six ICE Stories visible on map and list.
3. Changing any filter updates map pins and list together, with no page reload.
4. Switching Content Type to Global Stage zooms to a world view and shows the 15 global items.
5. Empty filter results show a single clear message, not a blank map.
6. The catalog domain can be unit-tested without rendering React or Leaflet.

---

## 4. Brand

**Name:** Institute of Climate and Environment (ICE)  
**Parent:** SIMAD University  
**Product title in UI:** Climate Story Map  

### Colour

| Token | Hex | Use |
| --- | --- | --- |
| `forest` | `#063D39` | Header bar, primary type on light surfaces |
| `mint` | `#4CAF7D` | Active filter, focus ring, selected pin |
| `leaf` | `#2E7D57` | Secondary accent (SDG chips hover) |
| `paper` | `#F7F6F2` | Page background behind map/list |
| `ink` | `#12211F` | Body text |
| `muted` | `#5C6B68` | Labels, placeholders |
| `line` | `#D9E2DE` | Borders, card strokes |
| `white` | `#FFFFFF` | Cards, list pane, header logos contrast |

Do not use IOM navy or red donate styling.

### Type

- UI: Inter (Google Fonts, free)
- Fallback: `system-ui, Segoe UI, sans-serif`
- Header labels: 11px, uppercase, letter-spacing 0.08em, colour white on forest
- Story titles: 1.05–1.4rem, weight 700, colour `ink`

### Logos

| Placement | File | Treatment |
| --- | --- | --- |
| Header left | `Sources/Images/SIMAD LOGO.webp` | SIMAD crest only. The file also contains a “25 Years” lockup; do not show the anniversary graphic in the header. If the crest cannot be isolated cleanly, use the full file at a height that keeps the crest legible (~40px) and hide overflow of the anniversary side. |
| Header right | `Sources/Images/ice logo.png` | White wordmark + globe (designed for dark green). Height ~40px. Alt: “Institute of Climate and Environment”. |
| Favicon / light surfaces | `Sources/Images/ice logo 2.png` | Dark-green wordmark. Not used on the forest header. |

---

## 5. Tech stack (all free / open source)

| Layer | Choice | Why |
| --- | --- | --- |
| App | Vite (current stable) + React 19 + TypeScript 5 (strict) | Fast, no server, KISS |
| Maps | Leaflet 1.9 + react-leaflet 5 | Free, OSM tiles, matches prior Somalia map work |
| Tiles | OpenStreetMap raster (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`) | No API key. Attribution required. |
| Catalog | `src/content/stories.json` | 21 items do not need a database |
| Tests | Vitest + React Testing Library | Unit tests for domain first |
| Lint | ESLint + typescript-eslint | |
| Style | One `src/ui/theme.css` using CSS variables from the brand table | No CSS-in-JS library |

No Redux, no Next.js, no Mapbox, no backend.

---

## 6. Information architecture

One route for v1:

- `/` — catalog (header + map + list)
- `/stories/:id` — story detail (same header, no map)

Deep-linking filters on `/` uses the query string so a journalist can share a view:

```
/?type=global-stage&theme=policy&sdg=13&q=COP
```

Unknown query keys are ignored. Invalid enum values are ignored (filter treated as unset).

---

## 7. Layout

```
+-----------------------------------------------------------------------+
| [SIMAD crest]   keyword | type | themes | date | SDGs    [ICE lockup] |
+----------------------------------+------------------------------------+
|                                  |  Results (n)                       |
|         Leaflet map              |  card                               |
|         (flex-grow)              |  card                               |
|                                  |  ...                                |
+----------------------------------+------------------------------------+
| OSM attribution (map control)    |                                    |
+-----------------------------------------------------------------------+
```

- Header is 64px, `position: sticky`, `forest` background, full viewport width.
- Below header: CSS grid `1.4fr 1fr` (map | list). On viewports `< 800px`: stack map (50vh) then list.
- List pane scrolls independently. Map does not.
- Active filters render as removable chips under the dropdown row, still inside the header’s second row (max 48px). If chips overflow, they wrap; header grows rather than hiding chips.

Header center filters, left to right:

1. Keyword text input (placeholder: “Search by keywords”)
2. Content Type
3. Themes
4. Date
5. SDGs

---

## 8. Domain model

Bounded context: **Catalog**.

### Aggregates and value objects

```ts
type ContentType = 'ice-story' | 'global-stage';

type SdgNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17;

type GeoLocation = {
  name: string;      // "Mogadishu, Somalia" | "Doha, Qatar"
  lat: number;       // WGS84
  lng: number;
};

type StoryId = string; // slug, e.g. "ecoson-waste-to-energy"

type Story = {
  id: StoryId;
  title: string;
  type: ContentType;
  date: string;          // ISO date YYYY-MM-DD
  themes: string[];      // from the closed theme list below
  sdgs: SdgNumber[];
  location: GeoLocation;
  summary: string;       // <= 280 chars, list card
  body: string;          // markdown-ish plain paragraphs, detail page
  images: string[];      // public paths under /images/...
};

type FilterCriteria = {
  query: string;                 // trim, case-insensitive
  type: ContentType | 'all';
  themes: string[];              // OR within themes
  year: number | 'all';          // calendar year of Story.date
  sdgs: SdgNumber[];             // OR within SDGs
};

type MapView = {
  center: { lat: number; lng: number };
  zoom: number;
};
```

A `Story` is the only aggregate. Filters are a value object. Map view is a derived value, not stored on the story.

### Closed theme list (v1)

These slugs are the only legal `themes` values. Stories may have more than one.

| Slug | Label |
| --- | --- |
| `youth` | Youth |
| `green-enterprise` | Green enterprise |
| `waste-energy` | Waste and energy |
| `oceans` | Oceans and coasts |
| `drought-water` | Drought and water |
| `art-communication` | Art and communication |
| `education` | Education |
| `policy-diplomacy` | Policy and diplomacy |
| `climate-mobility` | Climate mobility |
| `partnerships` | Partnerships |

### Content inventory (must all appear in `stories.json`)

**ICE Stories (`ice-story`), default Somalia pins:**

| id (proposed) | Title | Location |
| --- | --- | --- |
| `4c-art` | 4C Art: Turning Climate Change Into a Story People Can See | Mogadishu |
| `casuuro-plants` | Casuuro Plants: The Green Startup Greening Mogadishu | Mogadishu |
| `ecosom` | ECOSOM: Turning Waste Into Clean Energy and Green Jobs | Mogadishu |
| `geed-soor` | Geed Soor: From a School Garden to a Green Business in Mogadishu | Mogadishu |
| `liido-beach-cleanup` | Liido Beach Cleanup: The Young Somalis Reclaiming Mogadishu's Coast | Liido Beach, Mogadishu |
| `simad-drought` | SIMAD University: A University Responding to Drought, One Community at a Time | Mogadishu |

**Global Stage (`global-stage`), world pins at the event city:**

| Date | Title (short) | Pin city |
| --- | --- | --- |
| 2023-03-03 | Decoding COP27 | Mogadishu (local briefing after COP27) |
| 2023-03-05 | UN LDCs conference | Doha |
| 2023-03-20 | LDC5 week in Doha | Doha |
| 2023-10-02 | ChangemakerXchange Summit | Kigali |
| 2024-11-22 | COP29, Somali voices | Baku |
| 2024-11-24 | Joins WEF Global Future Council | Geneva |
| 2025-03-12 | ARA-TLS Africa Knowledge Symposium | Nairobi |
| 2025-04-05 | Third LDC Future Forum | Lusaka |
| 2025-05-25 | 4th IGAD Scientific Conference | Addis Ababa |
| 2025-08-19 | Manenga Ndulo Conference | Lusaka |
| 2025-10-26 | WEF Global Future Councils 2025 | Dubai |
| 2026-01-01 | ICE at COP30 | Belém |
| 2026-03-29 | Regional Symposium on Climate Mobility | Nairobi |
| 2026-05-16 | OECD Future of Development Co-operation | Paris |
| 2026-06-26 | Emerging Adaptation Fellowship Writeshop | Accra |

Exact `lat`/`lng`, themes, SDGs, summaries, and bodies are copied from the Word sources during the content task. If a source document names a different city than this table, the document wins. If no city is named, pin to Mogadishu (`2.0469, 45.3182`) and set `location.name` to `"Mogadishu (ICE Institute)"`.

### Coordinates used for map framing (not story pins)

- Somalia frame: center `5.15, 46.20`, zoom `6`
- World frame: center `15.0, 20.0`, zoom `2`
- Mogadishu fallback: `2.0469, 45.3182`

---

## 9. Domain policies

### FilterCatalog

Input: `stories: Story[]`, `criteria: FilterCriteria`  
Output: `Story[]` in source order (JSON order). No sort control in v1.

A story is included only if **all** of the following hold:

1. **Query:** if `query` is empty after trim, pass. Else `title`, `summary`, or `body` contains the query (case-insensitive).
2. **Type:** if `type === 'all'`, pass. Else `story.type === criteria.type`.
3. **Themes:** if `themes` is empty, pass. Else the story has **at least one** selected theme (OR).
4. **Year:** if `year === 'all'`, pass. Else `UTC year of story.date === year`.
5. **SDGs:** if `sdgs` is empty, pass. Else the story has **at least one** selected SDG (OR).

Themes AND SDGs are OR-within, AND-across groups. Example: theme Youth AND SDG 13 means youth stories that also tag 13.

### ResolveMapView

Input: `criteria: FilterCriteria`, `matches: Story[]`  
Output: `MapView`

| Condition | View |
| --- | --- |
| `criteria.type === 'global-stage'` | World frame |
| `criteria.type === 'ice-story'` | Somalia frame |
| `criteria.type === 'all'` and every match is `global-stage` (and matches length > 0) | World frame |
| otherwise | Somalia frame |

Pins: one marker per **matched** story. Stories that fail filters are not on the map.

Several ICE Stories share Mogadishu. The map adapter fans pins that round to the same 3-decimal lat/lng:

```
offsetLng = (indexInGroup - (groupSize - 1) / 2) * 0.012
offsetLat = ((indexInGroup % 2) * 2 - 1) * 0.006
```

`indexInGroup` is 0-based among currently matched stories at that point. This is presentation only; `Story.location` stays the true coordinate.

### Default criteria

```ts
{ query: '', type: 'ice-story', themes: [], year: 'all', sdgs: [] }
```

Default type is `ice-story` so the first screen is Somalia, not a mixed world scatter. The Content Type control still offers `all` and `global-stage`.

---

## 10. Application layer (use cases)

| Use case | Responsibility |
| --- | --- |
| `FilterCatalog` | Pure function. No I/O. |
| `ResolveMapView` | Pure function. No I/O. |
| `LoadCatalog` | Calls `StoryRepository.load()` once at startup. |
| `SyncFiltersToUrl` | Writes `FilterCriteria` to `window.location.search`. |
| `ParseFiltersFromUrl` | Inverse of the above. Invalid values → default. |

React hooks (`useCatalog`, `useFilters`) live in `ui/` and call these use cases. Hooks must not contain filter logic.

---

## 11. Infrastructure

### StoryRepository

```ts
interface StoryRepository {
  load(): Promise<Story[]>;
}
```

v1 implementation: `JsonStoryRepository` fetches `/content/stories.json` (copied to `public/content/stories.json` at build, or imported as a module). Failure: throw `CatalogLoadError`.

### MapPort

```ts
interface MapPort {
  setView(view: MapView): void;
  setPins(stories: Story[]): void;
}
```

v1 implementation: `LeafletMapAdapter`. UI must import `MapPort`, not Leaflet, except inside `infrastructure/` and the thin `ui/map/MapPane.tsx` wrapper.

OSM attribution must remain visible: `© OpenStreetMap contributors`.

---

## 12. UI components

| Component | Does | Does not |
| --- | --- | --- |
| `Header` | Logos + filter controls | Fetch data |
| `KeywordInput` | Controlled query string | Debounce longer than 150ms |
| `ContentTypeSelect` | `all` / `ice-story` / `global-stage` | Change map zoom itself |
| `ThemeSelect` | Multi-select from closed theme list | Free-text themes |
| `YearSelect` | Unique years present in loaded catalog + All | Arbitrary date ranges |
| `SdgSelect` | Multi-select 1–17, only SDGs that exist in catalog | Show unused SDGs |
| `FilterChips` | Removable chips for active filters | Duplicate filter state |
| `MapPane` | Renders adapter output | Filter stories |
| `StoryList` | Cards for current matches | Own copy of catalog |
| `StoryCard` | Image, type label, title, date, 2–3 SDG chips | Full body |
| `StoryDetail` | Title, date, type, themes, SDGs, images, body | Map |
| `EmptyState` | “No stories match these filters.” + Clear filters | |

Dropdowns follow the IOM pattern (full-width grey control, bold label, chevron) but use ICE colours.

---

## 13. Data flow

```
stories.json
    → JsonStoryRepository.load()
    → CatalogProvider (holds Story[])
    → URL + Header produce FilterCriteria
    → FilterCatalog(stories, criteria) → matches
    → ResolveMapView(criteria, matches) → MapView
    → StoryList(matches) + MapPane(matches, view)
    → click card/pin → /stories/:id
```

Single source of filter truth: React state in `CatalogProvider`, mirrored to the URL. Map and list never keep a private filtered array.

---

## 14. Error handling

| Case | Behaviour |
| --- | --- |
| JSON fails to load | Full-page message: “Climate stories could not be loaded.” Retry button calls `load()` again. Map unmounted. |
| Story id not found on detail route | Message + link back to `/`. |
| Story missing `lat`/`lng` | Excluded from pins; still shown in the list. Console warning in development only. |
| OSM tiles fail | Leaflet empty-tile look is acceptable; do not swap to a paid basemap. |
| Image 404 | Card shows forest-coloured placeholder with title initials. |
| Zero matches | Empty state in the list; map shows the resolved frame with no pins. |

Do not crash the tree on a single bad story. `LoadCatalog` skips an item that fails a runtime schema check and continues; if **all** items fail, treat as load error.

Runtime schema (minimal): `id`, `title`, `type`, `date`, `location.lat`, `location.lng` present and `type` in the enum. Invalid items are dropped.

---

## 15. Testing

TDD order:

1. `FilterCatalog` — query, type, theme OR, year, SDG OR, combined AND, empty catalog, default criteria.
2. `ResolveMapView` — ice-story → Somalia; global-stage → world; all + only global matches → world; all + mixed → Somalia; empty matches + global-stage → still world.
3. `ParseFiltersFromUrl` / `SyncFiltersToUrl` — round trip; junk query ignored.
4. `StoryCard` / `EmptyState` — RTL, no Leaflet.
5. Map adapter tests optional; if present, mock Leaflet.

Do not require Cypress/Playwright in v1.

---

## 16. Folder structure

```
/
  docs/superpowers/specs/2026-08-16-somalia-climate-story-map-design.md
  public/
    images/                # copied from Sources/Images for the web app
    logos/simad.webp
    logos/ice-lockup.png
    logos/ice-mark.png
    content/stories.json
  src/
    domain/
      story.ts
      filters.ts
      map-view.ts
      themes.ts
      sdg.ts
    application/
      filter-catalog.ts
      resolve-map-view.ts
      parse-filters-from-url.ts
      sync-filters-to-url.ts
    infrastructure/
      json-story-repository.ts
      leaflet-map-adapter.ts
    ui/
      theme.css
      CatalogProvider.tsx
      chrome/Header.tsx
      chrome/filters/*.tsx
      map/MapPane.tsx
      catalog/StoryList.tsx
      catalog/StoryCard.tsx
      catalog/EmptyState.tsx
      story/StoryDetail.tsx
      App.tsx
    main.tsx
  index.html
  package.json
  vite.config.ts
  tsconfig.json
  vitest.config.ts
```

`Sources/` stays as the editorial original. The app never reads `.docx` at runtime.

---

## 17. SOLID / DDD mapping

- **S:** `FilterCatalog` only filters. `Header` only collects input. `LeafletMapAdapter` only talks to Leaflet.
- **O:** A new filter dimension is a new field on `FilterCriteria` plus one predicate in `FilterCatalog`, not a change to MapPane.
- **L:** `JsonStoryRepository` is substitutable for `StoryRepository`.
- **I:** `MapPort` has two methods; no god-object map service.
- **D:** UI depends on `StoryRepository` and `MapPort` abstractions, not fetch/Leaflet.
- **DDD:** Catalog is the bounded context. `Story` is the aggregate. Use cases are application services. JSON and Leaflet are infrastructure.

---

## 18. v1 build sequence (for the later plan)

1. Scaffold Vite React TS + Vitest + CSS tokens + header logos (no map yet).
2. Domain types + `FilterCatalog` tests + implementation.
3. `ResolveMapView` tests + implementation.
4. `stories.json` for all 21 items (copy from Word sources).
5. `CatalogProvider` + filter controls + list.
6. Leaflet map + pin/list sync + URL query.
7. Story detail route.

---

## 19. Decisions log

| Decision | Choice |
| --- | --- |
| First screen | Hybrid map + list |
| v1 content | ICE Stories + Global Stage, both as pins and cards |
| Map geography | Somalia default; Global Stage zooms to world |
| Filters | Keyword, content type, themes, date (year), SDGs |
| Stack | Vite, React, TypeScript, Leaflet, OSM, JSON |
| Default content type | `ice-story` (Somalia-first) |
| Theme matching | OR within, AND across filter groups |
| Brand | ICE forest/mint, not IOM blue |
