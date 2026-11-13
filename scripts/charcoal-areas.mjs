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
 *   charcoal-export-places.geojson  where each potential export area is
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

// Where each potential export area is: the districts it covers (largest share
// first, at least 10% of the area) and the region of the main one.
const exportArea = `-i "${source}" encoding=utf8 name=charcoal -proj "${LAEA}" -each "${KIND}" -filter "kind === 'export'" -each "aid=this.id, ha=Math.round(this.area / 10000)" -filter-fields aid,ha`;
const labelPoints = JSON.parse(
  (await mapshaper.applyCommands(`${exportArea} -points inner -proj wgs84 -o format=geojson precision=0.0001 out.json`))['out.json'],
);
const overlap = JSON.parse(
  (
    await mapshaper.applyCommands(
      `${exportArea} -i "${shp('district')}" encoding=utf8 name=units -proj "${LAEA}" -each "district=String(admin2Name), region=String(admin1Name)" -filter-fields district,region ` +
        `-union target=charcoal,units -filter "aid !== null && aid !== undefined && !!district" -each "a=this.area" -o format=json out.json`,
    )
  )['out.json'],
);
for (const point of labelPoints.features) {
  const { aid, ha } = point.properties;
  const parts = overlap.filter((row) => row.aid === aid).sort((x, y) => y.a - x.a);
  const total = parts.reduce((sum, row) => sum + row.a, 0);
  const main = parts.filter((row) => row.a >= total * 0.1);
  point.properties = {
    ha,
    districts: (main.length ? main : parts.slice(0, 1)).map((row) => row.district),
    region: parts[0]?.region ?? '',
  };
}
writeFileSync(join(OUT, 'charcoal-export-places.geojson'), JSON.stringify(labelPoints));

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
