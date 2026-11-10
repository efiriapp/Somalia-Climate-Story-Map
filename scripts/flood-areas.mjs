/**
 * Flooded area by state, region and district, measured on the full-detail
 * FAO SWALIM flood maps (not the simplified map layers).
 *
 *   npm run data:areas        (also run at the end of npm run data:prepare)
 *
 * Areas are measured in hectares in a Lambert azimuthal equal-area projection
 * centred on Somalia (WGS 84 ellipsoid), so they are true ground areas.
 *
 * Boundaries: UNOCHA Somalia administrative boundaries (Adm1 states, Adm2
 * regions, Adm3 districts) as published on the FAO SWALIM GeoNode. Put the
 * three zip files in Sources/Data/boundaries/; they are unzipped here.
 *
 * Writes to public/data/watch/:
 *   admin-states.geojson, admin-regions.geojson, admin-districts.geojson
 *   flood-by-admin.json   hectares per flood for every state/region/district
 * and corrects area_ha in each flood layer to the equal-area figure.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { FLOOD_EVENTS, ROOT, SRC } from './flood-events.mjs';

const require = createRequire(import.meta.url);
const mapshaper = require('mapshaper');

const OUT = join(ROOT, 'public', 'data', 'watch');
const BOUNDARIES = join(ROOT, 'Sources', 'Data', 'boundaries');
const UNZIPPED = join(BOUNDARIES, 'unzipped');
const LAEA = '+proj=laea +lat_0=5 +lon_0=46 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs';

const LEVELS = {
  state: { zip: 'SOM_Adminbnda_Adm1_States_UNOCHA', id: 'Name', name: 'Name' },
  region: { zip: 'SOM_Adminbnda_Adm2_Regions_UNOCHA', id: 'admin1Pcod', name: 'admin1Name' },
  district: { zip: 'SOM_Adminbnda_Adm3_Districts_UNOCHA', id: 'admin2Pcod', name: 'admin2Name', parent: 'admin1Pcod' },
};

/** Short names and flag ids for the UNOCHA state names. */
const STATE = {
  Somaliland: { id: 'somaliland', name: 'Somaliland' },
  Puntland: { id: 'puntland', name: 'Puntland' },
  'Galmudug Administration': { id: 'galmudug', name: 'Galmudug' },
  Hirshabelle: { id: 'hirshabelle', name: 'Hirshabelle' },
  'South West Administration': { id: 'south-west', name: 'South West' },
  'Jubaland Administration': { id: 'jubaland', name: 'Jubaland' },
  Banadir: { id: 'banadir', name: 'Banadir' },
  'Somaliland-Puntland Border Claims': { id: 'border-claims', name: 'Somaliland–Puntland border claims' },
};

const shp = (level) => {
  const { zip } = LEVELS[level];
  const file = join(UNZIPPED, zip, `${zip}.shp`);
  if (!existsSync(file)) {
    const archive = join(BOUNDARIES, `${zip}.zip`);
    if (!existsSync(archive)) throw new Error(`Missing ${archive}`);
    mkdirSync(join(UNZIPPED, zip), { recursive: true });
    // tar reads zip files on Windows 10+, macOS and most Linux systems.
    execFileSync('tar', ['-xf', archive, '-C', join(UNZIPPED, zip)]);
  }
  return file;
};

// Boundaries: one unit id and name per feature; outlines for the map.
const units = {};
for (const [level, def] of Object.entries(LEVELS)) {
  const fields = `uid=String(${def.id}), uname=String(${def.name})${def.parent ? `, parent=String(${def.parent})` : ''}`;
  const out = await mapshaper.applyCommands(
    `-i "${shp(level)}" encoding=utf8 -proj wgs84 -each "${fields}" -filter-fields uid,uname${def.parent ? ',parent' : ''} ` +
      `-o format=json rows.json ` +
      `-simplify interval=${level === 'district' ? 300 : 500} keep-shapes -o format=geojson precision=0.0001 map.geojson`,
  );
  let rows = JSON.parse(out['rows.json']);
  let map = JSON.parse(out['map.geojson']);
  if (level === 'state') {
    const tidy = (r) => ({ ...r, uid: STATE[r.uname]?.id ?? r.uid, uname: STATE[r.uname]?.name ?? r.uname });
    rows = rows.map(tidy);
    map.features = map.features.map((f) => ({ ...f, properties: tidy(f.properties) }));
  }
  for (const f of map.features) f.properties = { id: f.properties.uid, name: f.properties.uname };
  writeFileSync(join(OUT, `admin-${level}s.geojson`), JSON.stringify(map));
  units[level] = rows.map((r) => ({ id: r.uid, name: r.uname, ...(r.parent ? { parent: r.parent } : {}) }));
  console.log(`${level}: ${rows.length} units`);
}

// Flood areas per unit -------------------------------------------------------------
const areas = { state: {}, region: {}, district: {} };
const totals = {};
for (const event of FLOOD_EVENTS) {
  const flood = join(SRC, event.file);
  const type = event.typeField
    ? `type = /non/i.test(${event.typeField}) ? "Flooded non-agricultural land" : "Flooded farmland"`
    : 'type = "Flooded area"';
  const base = `-i "${flood}" encoding=utf8 name=flood -proj "${LAEA}" -each '${type}' -filter-fields type -dissolve2 type`;

  const byType = JSON.parse((await mapshaper.applyCommands(`${base} -each "a=this.area" -o format=json out.json`))['out.json']);
  totals[event.id] = Object.fromEntries(byType.map((r) => [r.type, Math.round(r.a / 10000)]));

  for (const [level, def] of Object.entries(LEVELS)) {
    const out = await mapshaper.applyCommands(
      `${base} -each "f=1" -i "${shp(level)}" encoding=utf8 name=units -proj "${LAEA}" -each "uid=String(${def.id})" -filter-fields uid ` +
        `-union target=flood,units -filter "f===1 && !!uid" -each "a=this.area" -o format=json out.json`,
    );
    const sums = {};
    for (const row of JSON.parse(out['out.json'])) {
      const id = level === 'state' ? (STATE[row.uid]?.id ?? row.uid) : row.uid;
      sums[id] = (sums[id] ?? 0) + row.a / 10000;
    }
    areas[level][event.id] = Object.fromEntries(
      Object.entries(sums)
        .map(([id, ha]) => [id, Math.round(ha)])
        .filter(([, ha]) => ha > 0),
    );
  }
  const total = Object.values(totals[event.id]).reduce((s, v) => s + v, 0);
  const inStates = Object.values(areas.state[event.id]).reduce((s, v) => s + v, 0);
  console.log(`${event.id.padEnd(28)} ${String(total).padStart(8)} ha  (inside states ${inStates})`);
}

// Correct the flood layers' area_ha to the equal-area, full-detail figure.
for (const event of FLOOD_EVENTS) {
  const file = join(OUT, `${event.id}.geojson`);
  if (!existsSync(file)) continue;
  const fc = JSON.parse(readFileSync(file, 'utf8'));
  for (const f of fc.features) {
    const ha = totals[event.id][f.properties.type];
    if (ha !== undefined) f.properties.area_ha = ha;
  }
  writeFileSync(file, JSON.stringify(fc));
}

// Only units that flooded at least once are listed.
const flooded = (level) => new Set(Object.values(areas[level]).flatMap((byUnit) => Object.keys(byUnit)));
const levels = Object.fromEntries(
  Object.keys(LEVELS).map((level) => {
    const keep = flooded(level);
    return [level, { units: units[level].filter((u) => keep.has(u.id)), areas: areas[level] }];
  }),
);
writeFileSync(
  join(OUT, 'flood-by-admin.json'),
  JSON.stringify({
    generated: new Date().toISOString().slice(0, 10),
    credit: 'UNOCHA Somalia administrative boundaries (states, regions, districts), via FAO SWALIM',
    method: 'Full-detail FAO SWALIM flood extents, measured in a Lambert azimuthal equal-area projection (WGS 84), hectares',
    totals,
    levels,
  }),
);
console.log(`Flooded: ${levels.state.units.map((u) => u.name).join(', ')}`);
if (readdirSync(OUT).length === 0) throw new Error('nothing written');
