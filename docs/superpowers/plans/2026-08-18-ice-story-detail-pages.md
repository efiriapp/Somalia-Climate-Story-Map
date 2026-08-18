# ICE Story Detail Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Build **one story at a time** after the shared detail page exists.

**Goal:** When a visitor taps an ICE Stories card, they open a long-form page built from the source Word documents: narrative chapters, dataset counts, image gallery, ICE video slot, and a map of that story.

**Architecture:** Keep the existing `Story` catalog. Add optional detail fields (`chapters`, `stats`, `videoTitle`, `videoUrl`, `featuredPerson`, `placeLabel`). A new `StoryDetail` component renders those fields plus the existing Leaflet `MapPane` for a single pin. Fill one ICE story per task from `Sources/Contents/ICE Stories`. Do not invent YouTube IDs, street addresses, or coordinates the source forbids.

**Tech Stack:** Vite, React 19, TypeScript, Leaflet (`MapPane`), Vitest, existing forest/mint/leaf CSS.

## Global Constraints

- Only enrich `type: 'ice-story'` in this plan (six stories). Research and Global Stage keep the short detail until a later plan.
- Copy from the source `.docx` files. Shorten for the page, do not invent facts or counts.
- Map: use city-level Mogadishu unless the source already gives a place (Liido Beach). Do not invent a studio street pin.
- Video: use the ICE video title from the document. If no embeddable URL exists, show a poster + external link, never a fake YouTube id.
- Images: `/images/ice-stories/*` already in `public/`. SIMAD drought uses `/logos/simad.webp` until a source photo exists.
- TDD: failing test first. Filters stay on the grid; detail opens from a card tap.
- Commit after each story. Do not commit `Sources/` or `.tmp-docs/`.

## Files

- Modify: `src/domain/story.ts` — optional detail fields
- Create: `src/ui/catalog/StoryDetail.tsx` — long-form layout
- Create: `src/ui/catalog/StoryDetail.test.ts`
- Modify: `src/ui/App.tsx` — render `StoryDetail` instead of the short article
- Modify: `src/ui/theme.css` — detail gallery, stats, video, map
- Modify: `src/content/stories.ts` — one story per later task
- Modify: `src/content/stories.test.ts` — assert that story’s chapters/stats/images

## Story order (one by one)

1. **4C Art** (`4c-art`) — Arts and Climate Action
2. **Liido Beach Cleanup** (`liido-beach-cleanup`) — counts: 6 volunteers, 147 weeks, 119,873 litter items, 89.47% plastic
3. **ECOSOM** (`ecosom`) — 2019, 20,000+ households, 185+ jobs (58% women), 1.3M+ trees/year, 200 t/month
4. **Geed Soor** (`geed-soor`) — founded 19 September 2024
5. **Casuuro Plants** (`casuuro-plants`) — Dalbile Youth Initiative, city-level map only
6. **SIMAD drought** (`simad-drought`) — March 2026; Ceelgula 35+ families; Far-libaax ~180 households; 340+ households cited

---

### Task 1: Shared StoryDetail page

**Files:**
- Modify: `src/domain/story.ts`
- Create: `src/ui/catalog/StoryDetail.tsx`
- Create: `src/ui/catalog/StoryDetail.test.ts`
- Modify: `src/ui/App.tsx`
- Modify: `src/ui/theme.css`

**Interfaces:**
- Consumes: `Story`, `MapPane`, `formatTourDate`
- Produces: `StoryDetail({ story, onBack })`

- [ ] **Step 1: Write the failing test** in `src/ui/catalog/StoryDetail.test.ts` expecting `story-detail`, `story-stats`, `story-gallery`, `story-video`, `MapPane`, and `chapters`.
- [ ] **Step 2: Run** `npx vitest run src/ui/catalog/StoryDetail.test.ts` — expect FAIL.
- [ ] **Step 3: Add optional fields to `Story`:** `chapters?: { heading: string; paragraphs: string[] }[]`, `stats?: { label: string; value: string }[]`, `videoTitle?: string`, `videoUrl?: string`, `featuredPerson?: string`, `placeLabel?: string`.
- [ ] **Step 4: Implement `StoryDetail`** with back button, gallery of `story.images`, stats grid, iframe only when `videoUrl` contains `youtube.com/embed`, otherwise a video card linking out, chapters, and `MapPane` with `[story]`.
- [ ] **Step 5: Wire App** so ice-story (and any story with chapters) uses `StoryDetail`.
- [ ] **Step 6: Tests pass, commit** `feat: open a long-form ICE story page from the grid.`

---

### Task 2: 4C Art (first full story)

**Source:** `Sources/Contents/ICE Stories/4C Art_ Turning Climate Change Into a Story People Can See.docx`

**Stats from source:**
- Featured person: Abdinasir Abdikadir Mohamed (4C)
- Place: 4C Art Studio / Mogadishu
- 2024 UNSOS mural (climate change and social themes)
- 2023 climate exhibition at the Mogadishu Environmental Summit
- ICE video title: Arts and Climate Action | ICE Institute

**Images:** `/images/ice-stories/4c-art-1.jpg`, `4c-art-2.jpg`, `4c-art-3.png`

**Chapters:** Climate change on the canvas; From artist to creative entrepreneur; Young people as climate storytellers; Public mural 2024; 2023 summit exhibition; What we can learn.

- [ ] Test that `4c-art` has `chapters.length >= 4`, `stats.length >= 4`, three images, `videoTitle` matching Arts and Climate Action.
- [ ] Fill `stories.ts` from the source (no invented counts).
- [ ] Commit `feat: add the full 4C Art climate storytelling page.`

---

### Task 3: Liido Beach Cleanup

**Counts:** ~6 original volunteers; 147 consecutive weeks by 2024; 119,873 litter items; 89.47% plastics; recreational shoreline 54.12%; dumping 36.61%. Map at Liido Beach (existing lat/lng). Video title: Beach Cleaning Campaign in Mogadishu. Images: `liido-1.png`, `liido-2.jpeg`.

### Task 4: ECOSOM

**Counts:** Founded 2019; 20,000+ households; 185+ green jobs, 58% women; 1.3M+ trees/year; ~200 tonnes/month; 1,000 tonnes/month target by 2030. Expansion named: Mogadishu, Galkacyo, Dhusamareb (map Mogadishu city unless later verified). Video: Clean and Affordable Charcoal. Images: `ecosom-1.jpg`–`ecosom-4.jpg`.

### Task 5: Geed Soor

**Counts:** Founded 19 September 2024; founder Mohamed Omar; milestones ICE climate symposium, Mogadishu Environmental Summit. City-level map only. Images: `geed-soor-1.jpg`–`3.jpg`.

### Task 6: Casuuro Plants

**Counts:** Source has no numeric dataset — do not invent. Featured initiative Casuuro Plants; platform Dalbile Youth Initiative; city-level map. Video title: Casuuro Plants ICE Institute. Images: `casuuro-1.jpg`, `casuuro-2.jpg`.

### Task 7: SIMAD drought response

**Counts:** March 2026; Ceelgula, Mudug 35+ families (existing catalog); Far-libaax, Hiiraan ~180 households; 340+ pastoralist and farming households cited; regions Mudug, Baay, Hiiraan, Jubbada Hoose. Map Mogadishu (institution) — do not invent Ceelgula coordinates. Image: `/logos/simad.webp` until a source photo exists.
