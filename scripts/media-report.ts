/**
 * Lists every photo and video whose rights still need checking before launch.
 *
 *   npm run media:report
 *
 * Exits with code 1 while any photo needs permission from its owner.
 */
import { citeImage, citeVideo, storyImages, type Citation } from '../src/application/citations';
import { climateImpactPages } from '../src/content/climate-impact';
import { stories } from '../src/content/stories';

type Row = { where: string; media: string; citation: Citation };
const rows: Row[] = [];

for (const story of stories) {
  for (const src of storyImages(story)) rows.push({ where: story.id, media: src, citation: citeImage(src, story) });
  const videos = [...(story.videoUrl ? [{ url: story.videoUrl, title: story.videoTitle }] : []), ...(story.videos ?? [])];
  for (const video of videos) rows.push({ where: story.id, media: video.url, citation: citeVideo(video.url, video.title) });
}
for (const page of climateImpactPages) {
  for (const src of page.images) rows.push({ where: `climate-impact/${page.id}`, media: src, citation: citeImage(src) });
  for (const video of page.videos) rows.push({ where: `climate-impact/${page.id}`, media: video.url, citation: citeVideo(video.url, video.title) });
}

const byMedia = new Map<string, Row & { pages: Set<string> }>();
for (const row of rows) {
  const existing = byMedia.get(row.media);
  if (existing) existing.pages.add(row.where);
  else byMedia.set(row.media, { ...row, pages: new Set([row.where]) });
}

const counts: Record<string, number> = {};
for (const row of byMedia.values()) counts[row.citation.rights] = (counts[row.citation.rights] ?? 0) + 1;
console.log(`${byMedia.size} distinct photos and videos:`, counts);

for (const status of ['permission-needed', 'unconfirmed'] as const) {
  const list = [...byMedia.values()].filter((row) => row.citation.rights === status);
  if (!list.length) continue;
  console.log(
    `\n${status === 'permission-needed' ? 'NEEDS PERMISSION from the owner, or replace' : 'SOURCE NOT CONFIRMED, ask ICE'} (${list.length}):`,
  );
  for (const row of list) {
    console.log(`  ${row.media}\n    on: ${[...row.pages].join(', ')}\n    ${row.citation.text}`);
  }
}

if (counts['permission-needed']) process.exitCode = 1;
