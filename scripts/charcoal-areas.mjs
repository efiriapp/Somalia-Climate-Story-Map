/**
 * Charcoal production areas for Forest Watch.
 *
 *   npm run data:charcoal
 *
 * Source: FAO SWALIM, "Proposed Charcoal Production Areas" (PROSCAL, 2018),
 * Sources/Data/Characol/SOM_Proposed_Charcoal_Production_Areas.zip.
 *
 * Writes to public/data/watch/:
 *   charcoal-areas.geojson   the areas, by kind (export / local / studied)
 *   charcoal-sites.geojson   a marker point in each export or local area
 *   charcoal-by-admin.json   hectares of each kind in every state, region
 *                            and district (equal-area projection)
 */
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { LAEA, LEVELS, STATE, shapefileFrom, shp } from './admin-boundaries.mjs';
import { ROOT } from './flood-events.mjs';

const require = createRequire(import.meta.url);
const mapshaper = require('mapshaper');

const OUT = join(ROOT, 'public', 'data', 'watch');
const DIR = join(ROOT, 'Sources', 'Data', 'Characol');
const NAME = 'SOM_Proposed_Charcoal_Production_Areas';
const source = shapefileFrom(join(DIR, `${NAME}.zip`), join(DIR, 'unzipped'), NAME);

/** SWALIM's area names -> short kinds the site uses. */
const KIND = `kind = /export/i.test(Name) ? 'export' : /local/i.test(Name) ? 'local' : 'studied'`;
const KINDS = ['export', 'local', 'studied'];

// Map layer: one shape per kind, simplified.
const layer = await mapshaper.applyCommands(
  `-i "${source}" encoding=utf8 -proj wgs84 -each "${KIND}" -filter-fields kind -dissolve2 kind ` +
    `-simplify interval=150 keep-shapes -o format=geojson precision=0.0001 out.json`,
);
writeFileSync(join(OUT, 'charcoal-areas.geojson'), layer['out.json']);

// Map markers: a point inside each export or local area, with its size.
const sites = await mapshaper.applyCommands(
  `-i "${source}" encoding=utf8 -proj "${LAEA}" -each "${KIND}" -filter "kind !== 'studied'" ` +
    `-each "ha=Math.round(this.area / 10000)" -filter-fields kind,ha -points inner -proj wgs84 ` +
    `-o format=geojson precision=0.0001 out.json`,
);
writeFileSync(join(OUT, 'charcoal-sites.geojson'), sites['out.json']);

// Hectares of each kind in every unit of every level.
const levels = {};
for (const [level, def] of Object.entries(LEVELS)) {
  const out = await mapshaper.applyCommands(
    `-i "${source}" encoding=utf8 name=charcoal -proj "${LAEA}" -each "${KIND}" -filter-fields kind -dissolve2 kind ` +
      `-i "${shp(level)}" encoding=utf8 name=units -proj "${LAEA}" -each "uid=String(${def.id}), uname=String(${def.name})" -filter-fields uid,uname ` +
      `-union target=charcoal,units -filter "!!kind && !!uid" -each "a=this.area" -o format=json out.json`,
  );
  const areas = {};
  const names = {};
  for (const row of JSON.parse(out['out.json'])) {
    const id = level === 'state' ? (STATE[row.uname]?.id ?? row.uid) : row.uid;
    names[id] = level === 'state' ? (STATE[row.uname]?.name ?? row.uname) : row.uname;
    areas[id] ??= Object.fromEntries(KINDS.map((kind) => [kind, 0]));
    areas[id][row.kind] += row.a / 10000;
  }
  for (const id of Object.keys(areas)) {
    for (const kind of KINDS) areas[id][kind] = Math.round(areas[id][kind]);
  }
  levels[level] = {
    units: Object.keys(areas).map((id) => ({ id, name: names[id] })),
    areas,
  };
  console.log(`${level}: ${Object.keys(areas).length} units with charcoal areas`);
}

writeFileSync(
  join(OUT, 'charcoal-by-admin.json'),
  JSON.stringify({
    generated: new Date().toISOString().slice(0, 10),
    method: 'FAO SWALIM charcoal production areas, split by UNOCHA boundaries, measured in a Lambert azimuthal equal-area projection, hectares',
    kinds: KINDS,
    levels,
  }),
);
const sum = (kind) =>
  Object.values(levels.state.areas).reduce((total, byKind) => total + byKind[kind], 0);
console.log(KINDS.map((kind) => `${kind}: ${sum(kind).toLocaleString('en')} ha`).join(', '));
