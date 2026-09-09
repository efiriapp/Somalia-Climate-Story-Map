import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, createWriteStream } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const txtRoot = join(root, '.tmp-docs', 'research');
const outTs = join(root, 'src', 'content', 'research-stories.ts');
const imgDir = join(root, 'public', 'images', 'research');

const THEME_META = {
  Theme_1: {
    slug: 'agriculture-resilience',
    category: 'Agriculture & Resilience',
    dateBase: '2026-01',
  },
  Theme_2: {
    slug: 'human-tide',
    category: 'Conflict, Displacement & Urban Sprawl',
    dateBase: '2026-02',
  },
  Theme_3: {
    slug: 'green-frontier',
    category: 'Renewables & Digitalization',
    dateBase: '2026-03',
  },
  Theme_4: {
    slug: 'governance-finance',
    category: 'Governance & Finance',
    dateBase: '2026-04',
  },
  Theme_5: {
    slug: 'climate-hazards',
    category: 'Floods, Droughts & Heatwaves',
    dateBase: '2026-05',
  },
};

const PLACE_MAP = [
  {
    match: /qorioley|qoryooley|shabelle/i,
    region: 'lower-shabelle',
    district: 'qoryooley',
    location: { name: 'Qoryooley, Lower Shabelle', lat: 1.7878, lng: 44.53 },
  },
  {
    match: /merka|marka/i,
    region: 'lower-shabelle',
    district: 'marka',
    location: { name: 'Marka, Lower Shabelle', lat: 1.7159, lng: 44.771 },
  },
  {
    match: /kismayo|kismaayo|lower juba coastal/i,
    region: 'lower-juba',
    district: 'kismaayo',
    location: { name: 'Kismaayo, Lower Juba', lat: -0.3582, lng: 42.5454 },
  },
  {
    match: /gedo/i,
    region: 'gedo',
    district: 'garbahaarey',
    location: { name: 'Gedo Region, Somalia', lat: 3.0, lng: 42.2 },
  },
  {
    match: /baidoa|bay region/i,
    region: 'bay',
    district: 'baidoa',
    location: { name: 'Baidoa, Bay', lat: 3.1138, lng: 43.6519 },
  },
  {
    match: /middle juba/i,
    region: 'middle-juba',
    district: 'buaale',
    location: { name: 'Middle Juba, Somalia', lat: 1.08, lng: 42.6 },
  },
  {
    match: /galkayo|gaalkacyo/i,
    region: 'mudug',
    district: 'gaalkacyo',
    location: { name: 'Gaalkacyo, Mudug', lat: 6.7697, lng: 47.4308 },
  },
  {
    match: /berbera/i,
    region: 'woqooyi-galbeed',
    district: 'berbera',
    location: { name: 'Berbera, Woqooyi Galbeed', lat: 10.4396, lng: 45.0143 },
  },
  {
    match: /bosaso|bossaso/i,
    region: 'bari',
    district: 'bossaso',
    location: { name: 'Bossaso, Bari', lat: 11.275, lng: 49.18 },
  },
  {
    match: /juba and shabelle|riverine|agro-industrial|mogadishu|benadir|banaadir|urban corridors|regional capitals/i,
    region: 'banaadir',
    district: 'wadajir',
    location: { name: 'Mogadishu, Somalia', lat: 2.0469, lng: 45.3182 },
  },
  {
    match: /central and southern|pastoral corridors|rural hinterlands|charcoal/i,
    region: 'bay',
    district: 'baidoa',
    location: { name: 'Southern Somalia', lat: 3.1, lng: 43.6 },
  },
];

const DEFAULT_PLACE = {
  region: 'banaadir',
  district: 'wadajir',
  location: { name: 'Mogadishu, Somalia', lat: 2.0469, lng: 45.3182 },
};

const SDG_BY_THEME = {
  'agriculture-resilience': [2, 13, 15],
  'human-tide': [11, 13, 16],
  'green-frontier': [7, 9, 13],
  'governance-finance': [8, 13, 16],
  'climate-hazards': [6, 11, 13],
};

const u = (photoId) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&q=80`;

/** Verified free Unsplash photos (illustrative). */
const IMAGE_BY_THEME = {
  'agriculture-resilience': [
    { id: 'agriculture-1', url: u('photo-1500382017468-9049fed747ef'), credit: 'Unsplash', creditUrl: 'https://unsplash.com/' },
    { id: 'agriculture-2', url: u('photo-1464226184884-fa280b87c399'), credit: 'Unsplash', creditUrl: 'https://unsplash.com/' },
    { id: 'agriculture-3', url: u('photo-1574943320219-553eb213f72d'), credit: 'Unsplash', creditUrl: 'https://unsplash.com/' },
    { id: 'agriculture-4', url: u('photo-1542838132-92c53300491e'), credit: 'Unsplash', creditUrl: 'https://unsplash.com/' },
    { id: 'agriculture-5', url: u('photo-1610832958506-aa56368176cf'), credit: 'Unsplash', creditUrl: 'https://unsplash.com/' },
    { id: 'agriculture-6', url: u('photo-1581092918056-0c4c3acd3789'), credit: 'Unsplash', creditUrl: 'https://unsplash.com/' },
    { id: 'agriculture-7', url: u('photo-1625246333195-78d9c38ad449'), credit: 'Unsplash', creditUrl: 'https://unsplash.com/' },
  ],
  'human-tide': [
    { id: 'human-1', url: u('photo-1488521787991-ed7bbaae773c'), credit: 'Unsplash', creditUrl: 'https://unsplash.com/' },
    { id: 'human-2', url: u('photo-1448375240586-882707db888b'), credit: 'Unsplash', creditUrl: 'https://unsplash.com/' },
    { id: 'human-3', url: u('photo-1449824913935-59a10b8d2000'), credit: 'Unsplash', creditUrl: 'https://unsplash.com/' },
    { id: 'human-4', url: u('photo-1509099836639-18ba1795216d'), credit: 'Unsplash', creditUrl: 'https://unsplash.com/' },
    { id: 'human-5', url: u('photo-1625246333195-78d9c38ad449'), credit: 'Unsplash', creditUrl: 'https://unsplash.com/' },
    { id: 'human-6', url: u('photo-1469571486292-0ba58a3f068b'), credit: 'Unsplash', creditUrl: 'https://unsplash.com/' },
    { id: 'human-7', url: u('photo-1454165804606-c3d57bc86b40'), credit: 'Unsplash', creditUrl: 'https://unsplash.com/' },
  ],
  'green-frontier': [
    { id: 'green-1', url: u('photo-1509391366360-2e959784a276'), credit: 'Unsplash', creditUrl: 'https://unsplash.com/' },
    { id: 'green-2', url: u('photo-1473341304170-971dccb5ac1e'), credit: 'Unsplash', creditUrl: 'https://unsplash.com/' },
    { id: 'green-3', url: u('photo-1516321318423-f06f85e504b3'), credit: 'Unsplash', creditUrl: 'https://unsplash.com/' },
    { id: 'green-4', url: u('photo-1497435334941-8c899ee9e8e9'), credit: 'Unsplash', creditUrl: 'https://unsplash.com/' },
    { id: 'green-5', url: u('photo-1521791136064-7986c2920216'), credit: 'Unsplash', creditUrl: 'https://unsplash.com/' },
    { id: 'green-6', url: u('photo-1449824913935-59a10b8d2000'), credit: 'Unsplash', creditUrl: 'https://unsplash.com/' },
    { id: 'green-7', url: u('photo-1559827260-dc66d52bef19'), credit: 'Unsplash', creditUrl: 'https://unsplash.com/' },
  ],
  'governance-finance': [
    { id: 'gov-1', url: u('photo-1554224155-6726b3ff858f'), credit: 'Unsplash', creditUrl: 'https://unsplash.com/', localFallback: '/images/research/human-7.jpg' },
    { id: 'gov-2', url: u('photo-1529107386315-e1a2ed48a620'), credit: 'Unsplash', creditUrl: 'https://unsplash.com/', localFallback: '/images/research/human-7.jpg' },
    { id: 'gov-3', url: u('photo-1559526324-4b87b5e36e44'), credit: 'Unsplash', creditUrl: 'https://unsplash.com/', localFallback: '/images/research/green-5.jpg' },
    { id: 'gov-4', url: u('photo-1521791136064-7986c2920216'), credit: 'Unsplash', creditUrl: 'https://unsplash.com/', localFallback: '/images/research/green-5.jpg' },
    { id: 'gov-5', url: u('photo-1559827260-dc66d52bef19'), credit: 'Unsplash', creditUrl: 'https://unsplash.com/', localFallback: '/images/research/green-7.jpg' },
    { id: 'gov-6', url: u('photo-1563986768609-322da13575f3'), credit: 'Unsplash', creditUrl: 'https://unsplash.com/', localFallback: '/images/research/human-7.jpg' },
    { id: 'gov-7', url: u('photo-1454165804606-c3d57bc86b40'), credit: 'Unsplash', creditUrl: 'https://unsplash.com/', localFallback: '/images/research/human-7.jpg' },
  ],
  'climate-hazards': [
    { id: 'hazard-1', url: '', credit: 'ICE Institute — Climate Impact imagery', creditUrl: 'https://ice.simad.edu.so/', localPath: '/images/climate-impact/flood-1.jpg' },
    { id: 'hazard-2', url: '', credit: 'ICE Institute — Climate Impact imagery', creditUrl: 'https://ice.simad.edu.so/', localPath: '/images/climate-impact/drought-1.avif' },
    { id: 'hazard-3', url: '', credit: 'ICE Institute — Climate Impact imagery', creditUrl: 'https://ice.simad.edu.so/', localPath: '/images/climate-impact/mogadishu-heat-wave.jpg' },
    { id: 'hazard-4', url: '', credit: 'ICE Institute — Climate Impact imagery', creditUrl: 'https://ice.simad.edu.so/', localPath: '/images/climate-impact/flood-2.jpg' },
    { id: 'hazard-5', url: '', credit: 'ICE Institute — Climate Impact imagery', creditUrl: 'https://ice.simad.edu.so/', localPath: '/images/climate-impact/flood-3.jpg' },
    { id: 'hazard-6', url: '', credit: 'ICE Institute — Climate Impact imagery', creditUrl: 'https://ice.simad.edu.so/', localPath: '/images/climate-impact/drought-2.jpg' },
    { id: 'hazard-7', url: '', credit: 'ICE Institute — Climate Impact imagery', creditUrl: 'https://ice.simad.edu.so/', localPath: '/images/climate-impact/el-nino.jpg' },
  ],
};

const esc = (value) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r?\n/g, '\\n')
    .replace(/\u0000/g, '');

const slugify = (title) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 72);

const resolvePlace = (locationLine) => {
  for (const entry of PLACE_MAP) {
    if (entry.match.test(locationLine)) return entry;
  }
  return DEFAULT_PLACE;
};

const splitParagraphs = (block) => {
  const cleaned = block
    .replace(/Platform Integration Facts[\s\S]*$/i, '')
    .replace(/By (mapping|transforming|humanizing|highlighting|turning)[\s\S]*$/i, '')
    .trim();
  const chunks = cleaned
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^(The Narrative|The Emotional Narrative|The Data-Driven Reality)$/i.test(line));
  if (chunks.length <= 1) {
    return cleaned
      .split(/(?<=\.)\s+(?=[A-Z“"])/)
      .map((part) => part.trim())
      .filter((part) => part.length > 40);
  }
  return chunks;
};

const summarize = (paragraphs) => {
  const text = paragraphs.join(' ').replace(/\s+/g, ' ').trim();
  if (text.length <= 420) return text;
  const cut = text.slice(0, 420);
  const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '));
  return `${(lastStop > 180 ? cut.slice(0, lastStop + 1) : cut).trim()}`;
};

const parseFile = (filePath, themeKey, storyIndex) => {
  const raw = readFileSync(filePath, 'utf8').replace(/\uFFFD/g, '°');
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const titleLine =
    lines.find((line) => /^Story\s+\d+:/i.test(line)) ??
    lines.find((line) => /:.+/.test(line) && !/^Theme/i.test(line)) ??
    'Untitled research story';
  const title = titleLine.replace(/^Story\s+\d+:\s*/i, '').trim();
  const locationLine = lines.find((line) => /^Location:/i.test(line)) ?? '';
  const narrativeStart = lines.findIndex((line) =>
    /^(The Narrative|The Emotional Narrative|The Data-Driven Reality)/i.test(line),
  );
  const bodyLines = narrativeStart >= 0 ? lines.slice(narrativeStart) : lines.slice(3);
  const paragraphs = splitParagraphs(bodyLines.join('\n'));
  const place = resolvePlace(locationLine);
  const theme = THEME_META[themeKey];
  const image = IMAGE_BY_THEME[theme.slug][(storyIndex - 1) % IMAGE_BY_THEME[theme.slug].length];
  const summary = summarize(paragraphs);
  const body = paragraphs[0] ?? summary;
  const emotional = [];
  const data = [];
  let mode = 'emotional';
  for (const paragraph of paragraphs) {
    if (/data-driven reality/i.test(paragraph)) {
      mode = 'data';
      continue;
    }
    if (/emotional narrative|^the narrative$/i.test(paragraph)) {
      mode = 'emotional';
      continue;
    }
    if (mode === 'data') data.push(paragraph);
    else emotional.push(paragraph);
  }
  const chapters = [];
  if (emotional.length) chapters.push({ heading: 'The story', paragraphs: emotional });
  if (data.length) chapters.push({ heading: 'What the research shows', paragraphs: data });
  if (!chapters.length && paragraphs.length) chapters.push({ heading: 'The story', paragraphs });

  return {
    id: slugify(title),
    title,
    themeSlug: theme.slug,
    category: theme.category,
    date: `${theme.dateBase}-${String(storyIndex).padStart(2, '0')}`,
    place,
    sdgs: SDG_BY_THEME[theme.slug],
    summary,
    body,
    chapters,
    image,
  };
};

const collectStories = () => {
  const stories = [];
  const seen = new Set();
  for (const dir of readdirSync(txtRoot)) {
    const themeKey = Object.keys(THEME_META).find((key) => dir.startsWith(key));
    if (!themeKey) continue;
    const files = readdirSync(join(txtRoot, dir))
      .filter((name) => name.endsWith('.txt') && !/_1_\.txt$/.test(name))
      .sort();
    for (const file of files) {
      const storyMatch = file.match(/Story_(\d+)/i);
      const storyIndex = storyMatch ? Number(storyMatch[1]) : stories.length + 1;
      const parsed = parseFile(join(txtRoot, dir, file), themeKey, storyIndex);
      if (seen.has(parsed.id)) continue;
      seen.add(parsed.id);
      stories.push(parsed);
    }
  }
  return stories.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
};

const renderStory = (story) => {
  const imagePath = story.image.localPath ?? `/images/research/${story.image.id}.jpg`;
  const chapters = story.chapters
    .map(
      (chapter) => `      {
        heading: '${esc(chapter.heading)}',
        paragraphs: [
${chapter.paragraphs.map((p) => `          '${esc(p)}',`).join('\n')}
        ],
      }`,
    )
    .join(',\n');

  return `  {
    id: '${story.id}',
    title: '${esc(story.title)}',
    type: 'research-story',
    region: '${story.place.region}',
    district: '${story.place.district}',
    date: '${story.date}',
    themes: ['${story.themeSlug}'],
    sdgs: [${story.sdgs.join(', ')}],
    location: { name: '${esc(story.place.location.name)}', lat: ${story.place.location.lat}, lng: ${story.place.location.lng} },
    country: 'Somalia',
    website: 'https://ice.simad.edu.so/',
    summary: '${esc(story.summary)}',
    body: '${esc(story.body)}',
    featuredPerson: 'ICE Institute research series',
    placeLabel: '${esc(story.place.location.name)}',
    sourceCard: {
      place: '${esc(story.place.location.name)}',
      city: '${esc(story.place.location.name.split(',')[0])}',
      regionLabel: '${esc(story.category)}',
      country: 'Somalia',
      category: '${esc(story.category)}',
      impactAreas: ['Research', 'Climate evidence', '${esc(story.category)}'],
      featuredPerson: 'ICE Institute research series',
      primarySource: 'Photo: ${esc(story.image.credit)}',
      extras: [{ label: 'Photo page', value: '${esc(story.image.creditUrl)}' }],
    },
    images: ['${imagePath}'],
    chapters: [
${chapters}
    ],
  }`;
};

const FALLBACK_URL = u('photo-1500382017468-9049fed747ef');
const skipDownload = process.env.SKIP_DOWNLOAD === '1';

const downloadImage = async (image) => {
  if (image.localPath) return image.localPath;
  mkdirSync(imgDir, { recursive: true });
  const dest = join(imgDir, `${image.id}.jpg`);
  if (existsSync(dest) && readFileSync(dest).length > 1000) return dest;
  if (skipDownload) {
    if (image.localFallback) {
      const from = join(root, 'public', image.localFallback.replace(/^\//, ''));
      if (existsSync(from)) {
        writeFileSync(dest, readFileSync(from));
        return dest;
      }
    }
    process.stdout.write(`Skip missing ${image.id}\n`);
    return dest;
  }
  if (!image.url) return dest;
  const headers = {
    'User-Agent': 'Mozilla/5.0 (compatible; ICE-Climate-Story-Map/1.0)',
    Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
  };
  let response = await fetch(image.url, { headers, redirect: 'follow' });
  if (!response.ok) {
    process.stdout.write(`Fallback for ${image.id} (${response.status})\n`);
    response = await fetch(FALLBACK_URL, { headers, redirect: 'follow' });
  }
  if (!response.ok) throw new Error(`Failed ${image.id}: ${response.status} ${image.url}`);
  await pipeline(Readable.fromWeb(response.body), createWriteStream(dest));
  return dest;
};

const stories = collectStories();
const uniqueImages = new Map();
for (const story of stories) uniqueImages.set(story.image.id, story.image);

for (const image of uniqueImages.values()) {
  process.stdout.write(`Preparing ${image.id}...\n`);
  await downloadImage(image);
}

writeFileSync(
  outTs,
  `import type { Story } from '../domain/story';

/** Research stories sourced from Sources/Contents/Research theme packs. */
export const researchStories: Story[] = [
${stories.map(renderStory).join(',\n')}
];
`,
);
process.stdout.write(`Wrote ${stories.length} research stories to ${outTs}\n`);
