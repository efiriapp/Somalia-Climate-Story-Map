/**
 * Download Somalia-context Wikimedia Commons images into public/images/research/.
 */
import { createWriteStream } from 'node:fs';
import { mkdir, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { RESEARCH_IMAGE_SOURCES } from './research-image-sources.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'images', 'research');

const MAP = RESEARCH_IMAGE_SOURCES;

const UA = 'ICE-Climate-Story-Map/1.0 (research card imagery; educational nonprofit)';

const filePathUrl = (title) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(title)}?width=1400`;

async function download(title, dest) {
  const url = filePathUrl(title);
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'image/*' },
    redirect: 'follow',
  });
  if (!res.ok || !res.body) {
    throw new Error(`${title} -> HTTP ${res.status}`);
  }
  await mkdir(dirname(dest), { recursive: true });
  await pipeline(res.body, createWriteStream(dest));
  const info = await stat(dest);
  if (info.size < 2000) {
    throw new Error(`${title} too small (${info.size} bytes)`);
  }
  console.log(`ok ${dest.slice(root.length)} (${Math.round(info.size / 1024)} KB)`);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await mkdir(outDir, { recursive: true });
let failed = 0;
for (const [local, title] of Object.entries(MAP)) {
  const dest = join(outDir, local);
  try {
    // Skip if we already have a freshly replaced Somalia-sized file (>50KB typical)
    try {
      const existing = await stat(dest);
      if (existing.size > 50_000 && existing.mtimeMs > Date.now() - 1000 * 60 * 30) {
        console.log(`skip ${local} (already fresh)`);
        continue;
      }
    } catch {
      // missing file — download
    }
    await download(title, dest);
    await sleep(1500);
  } catch (err) {
    failed += 1;
    console.error(`FAIL ${local}:`, err.message);
    await sleep(4000);
    try {
      await download(title, dest);
      failed -= 1;
      console.log(`retry ok ${local}`);
    } catch (retryErr) {
      console.error(`RETRY FAIL ${local}:`, retryErr.message);
    }
  }
}
console.log(failed ? `done with ${failed} failures` : `done ${Object.keys(MAP).length} Somalia images`);
process.exitCode = failed ? 1 : 0;
