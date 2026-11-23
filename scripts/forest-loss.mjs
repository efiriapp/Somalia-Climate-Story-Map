/**
 * Tree cover loss per year in every Somali state, region and district.
 *
 *   npm run data:forest
 *
 * Source: Hansen/UMD Global Forest Change v1.13 (2001–2025), the data behind
 * Global Forest Watch, CC BY 4.0. Put the lossyear and treecover2000 GeoTIFFs
 * for tiles 20N_040E, 20N_050E, 10N_040E, 10N_050E and 00N_040E in
 * Sources/Data/forest/hansen-v1.13/ (from
 * https://storage.googleapis.com/earthenginepartners-hansen/GFC-2025-v1.13/).
 *
 * As on Global Forest Watch, loss counts only where tree cover in 2000 was
 * above 30%. Each 0.00025° pixel adds its true ground area. Only pixels inside
 * Somalia's UNOCHA boundaries are counted.
 *
 * Writes public/data/watch/forest-loss.json and somalia-outline.geojson.
 */
import { existsSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fromFile } from 'geotiff';
import { LEVELS, STATE, shp } from './admin-boundaries.mjs';
import { ROOT } from './flood-events.mjs';
import { makeLocator, pixelAreaHa } from './geo-stats.mjs';

const require = createRequire(import.meta.url);
const mapshaper = require('mapshaper');

const OUT = join(ROOT, 'public', 'data', 'watch');
const DIR = join(ROOT, 'Sources', 'Data', 'forest', 'hansen-v1.13');
const TILES = ['20N_040E', '20N_050E', '10N_040E', '10N_050E', '00N_040E'];
const FIRST = 2001;
const LAST = 2025;
const CANOPY = 30;
const STRIP = 256;

const file = (layer, tile) => {
  const path = join(DIR, `Hansen_GFC-2025-v1.13_${layer}_${tile}.tif`);
  if (!existsSync(path)) throw new Error(`Missing ${path}`);
  return path;
};
// Fail fast: every input must be there before hours of work start.
for (const tile of TILES) for (const layer of ['lossyear', 'treecover2000']) file(layer, tile);

// Boundaries, full detail, WGS 84 --------------------------------------------------
const units = {};
const locators = {};
for (const [level, def] of Object.entries(LEVELS)) {
  const out = await mapshaper.applyCommands(
    `-i "${shp(level)}" encoding=utf8 -proj wgs84 -each "uid=String(${def.id}), uname=String(${def.name})" -o format=geojson out.json`,
  );
  const features = JSON.parse(out['out.json']).features;
  const idOf = (f) => (level === 'state' ? (STATE[f.properties.uname]?.id ?? f.properties.uid) : f.properties.uid);
  const nameOf = (f) => (level === 'state' ? (STATE[f.properties.uname]?.name ?? f.properties.uname) : f.properties.uname);
  units[level] = [...new Map(features.map((f) => [idOf(f), { id: idOf(f), name: nameOf(f) }])).values()];
  locators[level] = makeLocator(features, idOf);
}

// Somalia's outline, for clipping the forest layers on the map.
const outline = await mapshaper.applyCommands(
  `-i "${shp('state')}" encoding=utf8 -proj wgs84 -dissolve2 -simplify interval=300 keep-shapes -o format=geojson geojson-type=FeatureCollection precision=0.0001 out.json`,
);
writeFileSync(join(OUT, 'somalia-outline.geojson'), outline['out.json']);
// Somalia's bounding box: only this part of each raster tile is read.
const points = (c) => (typeof c[0] === 'number' ? [c] : c.flatMap(points));
const box = points(JSON.parse(outline['out.json']).features[0].geometry.coordinates).reduce(
  ([w, s, e, n], [x, y]) => [Math.min(w, x), Math.min(s, y), Math.max(e, x), Math.max(n, y)],
  [180, 90, -180, -90],
);
console.log(`Somalia box: ${box.map((v) => v.toFixed(2)).join(', ')}`);

// Loss per unit and year ------------------------------------------------------------
const years = LAST - FIRST + 1;
const loss = Object.fromEntries(Object.keys(LEVELS).map((level) => [level, {}]));
const add = (level, id, year, ha) => {
  loss[level][id] ??= new Array(years).fill(0);
  loss[level][id][year - FIRST] += ha;
};

for (const tile of TILES) {
  const lossImage = await (await fromFile(file('lossyear', tile))).getImage();
  const coverImage = await (await fromFile(file('treecover2000', tile))).getImage();
  const [west, , , north] = lossImage.getBoundingBox();
  const [size] = lossImage.getResolution();
  const width = lossImage.getWidth();
  const height = lossImage.getHeight();
  const col0 = Math.max(0, Math.floor((box[0] - west) / size));
  const col1 = Math.min(width, Math.ceil((box[2] - west) / size));
  const row0 = Math.max(0, Math.floor((north - box[3]) / size));
  const row1 = Math.min(height, Math.ceil((north - box[1]) / size));
  if (col0 >= col1 || row0 >= row1) continue;
  let pixels = 0;
  const started = Date.now();
  for (let r = row0; r < row1; r += STRIP) {
    const window = [col0, r, col1, Math.min(row1, r + STRIP)];
    const [years_] = await lossImage.readRasters({ window, samples: [0] });
    const [cover] = await coverImage.readRasters({ window, samples: [0] });
    const cols = col1 - col0;
    for (let i = 0; i < years_.length; i++) {
      const y = years_[i];
      if (!y || cover[i] <= CANOPY) continue;
      const row = r + Math.floor(i / cols);
      const lat = north - (row + 0.5) * size;
      const lng = west + (col0 + (i % cols) + 0.5) * size;
      const district = locators.district(lng, lat);
      if (!district) continue; // outside Somalia
      const ha = pixelAreaHa(lat, size);
      add('district', district, 2000 + y, ha);
      const region = locators.region(lng, lat);
      if (region) add('region', region, 2000 + y, ha);
      const state = locators.state(lng, lat);
      if (state) add('state', state, 2000 + y, ha);
      pixels++;
    }
  }
  console.log(`${tile}: ${pixels} loss pixels in Somalia (${Math.round((Date.now() - started) / 1000)} s)`);
}

const round = (values) => values.map((v) => Math.round(v * 10) / 10);
const levels = Object.fromEntries(
  Object.keys(LEVELS).map((level) => [
    level,
    {
      units: units[level].filter((u) => loss[level][u.id]),
      loss: Object.fromEntries(Object.entries(loss[level]).map(([id, values]) => [id, round(values)])),
    },
  ]),
);
// Somalia's total from districts: every counted pixel is in one (the state
// layer has small gaps along its edges).
const total = round(
  Object.values(loss.district).reduce((sum, values) => sum.map((v, i) => v + values[i]), new Array(years).fill(0)),
);
writeFileSync(
  join(OUT, 'forest-loss.json'),
  JSON.stringify({
    generated: new Date().toISOString().slice(0, 10),
    method: `Hansen/UMD Global Forest Change v1.13, loss where tree cover in 2000 > ${CANOPY}%, inside UNOCHA boundaries, hectares`,
    firstYear: FIRST,
    lastYear: LAST,
    total,
    levels,
  }),
);
console.log(`Somalia ${FIRST}–${LAST}: ${Math.round(total.reduce((s, v) => s + v, 0))} ha`);
