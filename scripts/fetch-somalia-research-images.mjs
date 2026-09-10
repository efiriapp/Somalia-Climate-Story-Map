/**
 * Download Somalia-context Wikimedia Commons images into public/images/research/.
 */
import { createWriteStream } from 'node:fs';
import { mkdir, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'images', 'research');

/** Local filename -> Wikimedia Commons file title (without File:) */
const MAP = {
  // Agriculture & resilience
  'agriculture-1.jpg': 'Afgoi Farms, Lower Shabelle Somalia. Beeraha Afgooye.jpg',
  'agriculture-2.jpg': 'Jamaame maize field.jpg',
  'agriculture-3.jpg': 'Somali female farmer in Afgoye near Mogadishu.jpg',
  'agriculture-4.jpg': 'Somalia farmers2.JPEG',
  'agriculture-5.jpg': 'Somaliland Mango Plantation.jpg',
  'agriculture-6.jpg': 'Gabilay farming.jpg',
  'agriculture-7.jpg': 'Champ de blé à Gabiley somaliland.JPG',
  // Conflict & displacement / human tide
  'human-1.jpg': 'Somali cattle.JPG',
  'human-2.jpg': 'Muhumed watching his cattle drink water at a in Dhobley (11400244664).jpg',
  'human-3.jpg': 'Bakool water catchment.jpg',
  'human-4.jpg': 'Somali nomad thatching hut.jpg',
  'human-5.jpg': 'Bauern bei der Feldarbeit in Somaliland.jpg',
  'human-6.jpg': 'Farm group activities in aburin, near Hargeisa Domalia.jpg',
  'human-7.jpg': 'Somalia farmers3.jpg',
  // Renewables & digitalization / green frontier
  'green-1.jpg': 'Liido Beach Muqdisho 2020.jpg',
  'green-2.jpg': 'Liido Beach Muqdisho 2020 (2).jpg',
  'green-3.jpg': 'Liido beach Mogadishu Somalia.jpg',
  'green-4.jpg': 'Mogadishu Liido beach.JPG',
  'green-5.jpg': 'Liido Beach Muqdisho 2020A.jpg',
  'green-6.jpg': 'A busy street in Mogadishu.jpg',
  'green-7.jpg': 'Mogadishu Sea Port.jpg',
  // Governance & finance — civilian city/life only (no AU/AMISOM/UNOSOM/forces)
  'gov-1.jpg': 'A busy street in Mogadishu 1.jpg',
  'gov-2.jpg': 'A busy street in Mogadishu 2.jpg',
  'gov-3.jpg': 'Night Mogadishu Somalia.jpg',
  'gov-4.jpg': 'Mogadishu, Somalia.JPG',
  'gov-5.jpg': 'Liido Beach Muqdisho 2020.jpg',
  'gov-6.jpg': 'Aden Abudllahi Airport.jpg',
  'gov-7.jpg': 'Mogadishu Beach.jpg',
};

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
