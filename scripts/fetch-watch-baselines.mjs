/**
 * Builds the 1991–2020 baselines that Flood Watch and Drought Watch compare
 * live data against, and writes src/content/watch-baselines.ts.
 *
 *   npm run watch:baselines
 *
 * Data: Open-Meteo (free, non-commercial use, CC BY 4.0):
 * - Flood API: GloFAS v4 river discharge reanalysis (Copernicus Emergency
 *   Management Service). Each station snaps to the 5 km river cell with the
 *   highest flow near the town, because the nearest cell is often off-channel.
 * - Archive API: ERA5 daily precipitation (Copernicus Climate Change Service).
 *
 * Only needs rerunning if stations or towns change. Open-Meteo's free tier
 * counts long date ranges as many calls (about one per two weeks per
 * location), so a full run is large: each finished station and town is cached
 * in .cache/watch-baselines/ and the script waits out rate limits, so it can
 * simply be run again to resume.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outFile = join(root, 'src', 'content', 'watch-baselines.ts');
const UA = 'ICE-Climate-Story-Map/1.0 (watch baselines; educational nonprofit)';
const cacheDir = join(root, '.cache', 'watch-baselines');
mkdirSync(cacheDir, { recursive: true });
const cached = async (key, produce) => {
  const file = join(cacheDir, `${key}.json`);
  if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'));
  const value = await produce();
  writeFileSync(file, JSON.stringify(value));
  return value;
};
const START = '1991-01-01';
const END = '2020-12-31';

/** River stations: town position; the river cell is searched around it. */
const STATIONS = [
  { id: 'beledweyne', river: 'shabelle', name: 'Beledweyne', lat: 4.7358, lng: 45.2036 },
  { id: 'bulo-burte', river: 'shabelle', name: 'Bulo Burte', lat: 3.8536, lng: 45.5667 },
  { id: 'jowhar', river: 'shabelle', name: 'Jowhar', lat: 2.7809, lng: 45.5003 },
  { id: 'afgooye', river: 'shabelle', name: 'Afgooye', lat: 2.1414, lng: 45.1211 },
  { id: 'luuq', river: 'juba', name: 'Luuq', lat: 3.8, lng: 42.5444 },
  { id: 'bardheere', river: 'juba', name: 'Bardheere', lat: 2.3333, lng: 42.2833 },
  { id: 'jamaame', river: 'juba', name: 'Jamaame', lat: 0.07, lng: 42.75 },
];

/** Towns for Drought Watch, spread across Somalia's main livelihood zones. */
const TOWNS = [
  { id: 'hargeisa', name: 'Hargeisa', lat: 9.56, lng: 44.065 },
  { id: 'burao', name: 'Burao', lat: 9.522, lng: 45.534 },
  { id: 'bosaso', name: 'Bosaso', lat: 11.284, lng: 49.182 },
  { id: 'garowe', name: 'Garowe', lat: 8.406, lng: 48.482 },
  { id: 'galkayo', name: 'Galkayo', lat: 6.769, lng: 47.431 },
  { id: 'dhusamareb', name: 'Dhusamareb', lat: 5.535, lng: 46.386 },
  { id: 'beledweyne', name: 'Beledweyne', lat: 4.736, lng: 45.204 },
  { id: 'baidoa', name: 'Baidoa', lat: 3.114, lng: 43.65 },
  { id: 'mogadishu', name: 'Mogadishu', lat: 2.046, lng: 45.318 },
  { id: 'luuq', name: 'Luuq', lat: 3.8, lng: 42.544 },
  { id: 'kismayo', name: 'Kismayo', lat: -0.358, lng: 42.545 },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getJson = async (url) => {
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.ok) return res.json();
    if (res.status !== 429 || attempt === 30) {
      throw new Error(`HTTP ${res.status} for ${url.slice(0, 120)}`);
    }
    const reset = Number(res.headers.get('x-ratelimit-reset'));
    const waitMs = reset ? Math.max(reset * 1000 - Date.now(), 0) + 5000 : 10 * 60 * 1000;
    const minutes = Math.min(waitMs, 60 * 60 * 1000) / 60000;
    console.log(`  rate limited by Open-Meteo; waiting ${minutes.toFixed(1)} min (${new Date().toISOString()})`);
    await sleep(Math.min(waitMs, 60 * 60 * 1000));
  }
};

const percentile = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.floor(p * (sorted.length - 1)))];
const round = (value, digits = 1) => Math.round(value * 10 ** digits) / 10 ** digits;

const findRiverCell = async (station) => {
  const lats = [];
  const lngs = [];
  for (let i = -3; i <= 3; i += 1) {
    for (let j = -3; j <= 3; j += 1) {
      lats.push((station.lat + i * 0.05).toFixed(3));
      lngs.push((station.lng + j * 0.05).toFixed(3));
    }
  }
  const cells = await getJson(
    `https://flood-api.open-meteo.com/v1/flood?latitude=${lats}&longitude=${lngs}&daily=river_discharge&start_date=2020-05-01&end_date=2020-05-14`,
  );
  let best = null;
  for (const cell of cells) {
    const values = cell.daily.river_discharge.filter((v) => v != null);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    if (!best || mean > best.mean) best = { lat: cell.latitude, lng: cell.longitude, mean };
  }
  return best;
};

const stations = [];
for (const station of STATIONS) {
  const cell = await cached(`cell-${station.id}`, () => findRiverCell(station));
  const discharge = await cached(`flow-${station.id}`, async () => {
    const history = await getJson(
      `https://flood-api.open-meteo.com/v1/flood?latitude=${cell.lat}&longitude=${cell.lng}&daily=river_discharge&start_date=${START}&end_date=${END}`,
    );
    return history.daily.river_discharge;
  });
  const sorted = discharge.filter((v) => v != null).sort((a, b) => a - b);
  const entry = {
    ...station,
    cellLat: round(cell.lat, 4),
    cellLng: round(cell.lng, 4),
    median: round(percentile(sorted, 0.5)),
    p90: round(percentile(sorted, 0.9)),
    p98: round(percentile(sorted, 0.98)),
    max: round(sorted.at(-1)),
  };
  stations.push(entry);
  console.log(`${station.name}: cell ${entry.cellLat},${entry.cellLng} median ${entry.median} p90 ${entry.p90} p98 ${entry.p98} max ${entry.max} m³/s`);
  await sleep(1000);
}

/** Day-of-year index 0..364 (Feb 29 shares Feb 28's slot). */
const dayIndex = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  const start = Date.UTC(y, 0, 1);
  let index = Math.round((Date.UTC(y, m - 1, d) - start) / 86400000);
  const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  if (leap && index >= 59) index -= 1;
  return Math.min(index, 364);
};

const towns = [];
for (const town of TOWNS) {
  const { time, precipitation_sum: values } = await cached(`rain-${town.id}`, async () => {
    const result = await getJson(
      `https://archive-api.open-meteo.com/v1/archive?latitude=${town.lat}&longitude=${town.lng}&daily=precipitation_sum&start_date=${START}&end_date=${END}&timezone=Africa%2FMogadishu`,
    );
    return result.daily;
  });
  // Trailing 90-day sums for every day after the first 90, averaged per day of year.
  const totals = new Array(365).fill(0);
  const counts = new Array(365).fill(0);
  let running = 0;
  for (let i = 0; i < values.length; i += 1) {
    running += values[i] ?? 0;
    if (i >= 90) running -= values[i - 90] ?? 0;
    if (i >= 89) {
      const slot = dayIndex(time[i]);
      totals[slot] += running;
      counts[slot] += 1;
    }
  }
  const normal90 = totals.map((total, slot) => Math.round(total / counts[slot]));
  const annual = Math.round(values.reduce((sum, v) => sum + (v ?? 0), 0) / 30);
  console.log(`${town.name}: mean annual rainfall ${annual} mm, 90-day normal range ${Math.min(...normal90)}–${Math.max(...normal90)} mm`);
  towns.push({ ...town, annual, normal90 });
}

writeFileSync(
  outFile,
  `// Generated by scripts/fetch-watch-baselines.mjs (npm run watch:baselines). Do not edit by hand.
// Baseline period ${START} to ${END}. Sources: GloFAS v4 river discharge reanalysis
// (Copernicus Emergency Management Service) and ERA5 precipitation (Copernicus Climate
// Change Service), both via Open-Meteo (CC BY 4.0).

export type RiverId = 'shabelle' | 'juba';

export type FloodStation = {
  id: string;
  river: RiverId;
  name: string;
  /** Town position, for the map. */
  lat: number;
  lng: number;
  /** GloFAS river cell the data is read from. */
  cellLat: number;
  cellLng: number;
  /** Daily discharge statistics for ${START.slice(0, 4)}–${END.slice(0, 4)}, m³/s. */
  median: number;
  p90: number;
  p98: number;
  max: number;
};

export type DroughtTown = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  /** Mean annual rainfall, mm. */
  annual: number;
  /** Normal rainfall in the 90 days ending on each day of the year (index 0 = 1 January), mm. */
  normal90: number[];
};

export const BASELINE_PERIOD = '${START.slice(0, 4)}–${END.slice(0, 4)}';

export const FLOOD_STATIONS: FloodStation[] = ${JSON.stringify(stations, null, 2)};

export const DROUGHT_TOWNS: DroughtTown[] = ${JSON.stringify(towns)};
`,
);
console.log(`Wrote ${outFile.slice(root.length + 1)}`);
