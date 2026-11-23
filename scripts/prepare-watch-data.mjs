/**
 * Converts ICE's flood and drought shapefiles (FAO SWALIM exports) into small
 * web-map GeoJSON files for the Flood Watch and Drought Watch pages.
 *
 *   npm run data:prepare
 *
 * Input:  Sources/Data/extracted/  (the unzipped SOM_Flood Data and
 *         SOM_Droughts Data archives; not committed, see .gitignore)
 * Output: public/data/watch/*.geojson  plus  public/data/watch/index.json,
 *         a manifest the app reads to list layers.
 *
 * Every layer is reprojected to WGS 84 (some flood maps are UTM zone 38N),
 * merged ("dissolved") where thousands of small shapes describe one area,
 * simplified to a resolution that suits each layer, and stripped to the
 * fields the maps need. Uses mapshaper (MPL-2.0).
 */
import { mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FLOODS, FLOOD_EVENTS, RECENT, SRC } from './flood-events.mjs';

const require = createRequire(import.meta.url);
const mapshaper = require('mapshaper');

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'public', 'data', 'watch');
const DROUGHTS = 'droughts/SOM_Droughts Data ';

const SWALIM = 'FAO SWALIM (Somalia Water and Land Information Management)';
const swalimUrl = (layer) =>
  `https://spatial.faoswalim.org/layers/geonode:${layer}`;

/** Simplification interval in metres, by kind of layer. */
const DETAIL = { flood: 20, plain: 60, drought: 800, river: 40 };

// ---------------------------------------------------------------------------
// Flood events: one file each, dissolved by flood type where the source has it.
// ---------------------------------------------------------------------------


const SEASON_LABEL = { gu: 'Gu', deyr: 'Deyr', hagaa: 'Hagaa' };

// ---------------------------------------------------------------------------
// Drought conditions: one combined file, one feature per month and class.
// ---------------------------------------------------------------------------
const MONTHS = { January: '01', February: '02', March: '03', April: '04', May: '05', June: '06', July: '07', August: '08', September: '09', October: '10', November: '11', December: '12' };
const DROUGHT_FILES = [
  ['Som_Drought_Conditions_January_2017', 15],
  ['Som_Drought_Conditions_April_2017', 11],
  ['Drought_Conditions_December_2017', 5],
  ['Drought_Conditions_January_2019', 14],
  ['Drought_Conditions_March_2019', 6],
  ['Drought_Conditions_April_2021', 1],
  ['Drought_Conditions_August_2021', 3],
  // Folders 10 and 13 hold the same September 2021 map; one copy is enough.
  ['Drought_Conditions_September_2021', 10],
  ['Drought_Conditions_October_2021', 9],
  ['Drought_Conditions_December_2021', 17],
  ['Drought_Conditions_January_2022', 12],
  ['Drought_Conditions_February_2022', 16],
  ['Drought_Conditions_March_2022', 7],
  ['Drought_Conditions_April_2022', 2],
  ['Drought_Conditions_May_2022', 8],
  ['Drought_Conditions_August_2022', 4],
];
const DROUGHT_CLASSES = ['No Drought', 'Mild', 'Moderate', 'Severe', 'Extreme'];

// ---------------------------------------------------------------------------

const manifest = { generated: new Date().toISOString().slice(0, 10), layers: [] };
const problems = [];
const notes = [];

const run = async (commands, label) => {
  try {
    return await mapshaper.applyCommands(commands, {});
  } catch (error) {
    throw new Error(`${label}: ${error.message ?? error}`);
  }
};

const write = (id, text, meta) => {
  const file = join(OUT, `${id}.geojson`);
  writeFileSync(file, text);
  const fc = JSON.parse(text);
  const kb = Math.round(statSync(file).size / 1024);
  manifest.layers.push({ id, file: `${id}.geojson`, features: fc.features.length, sizeKB: kb, ...meta });
  console.log(`${id.padEnd(30)} ${String(fc.features.length).padStart(4)} features  ${String(kb).padStart(6)} KB`);
};

const input = (rel) => `-i "${join(SRC, rel)}" encoding=utf8 -proj wgs84`;
// 4 decimal places is about 11 m, finer than the 20–800 m simplification above.
const output = (name) => `-o format=geojson precision=0.0001 ${name}`;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// Flood events -----------------------------------------------------------------
for (const event of FLOOD_EVENTS) {
  const type = event.typeField
    ? `-each 'type = /non/i.test(${event.typeField}) ? "Flooded non-agricultural land" : "Flooded farmland"'`
    : `-each 'type = "Flooded area"'`;
  const result = await run(
    `${input(event.file)} ${type} -filter-fields type ` +
      `-dissolve2 type -simplify interval=${event.detail ?? DETAIL.flood} keep-shapes ` +
      `-filter-slivers min-area=${event.minArea ?? 5000} ` +
      `-each 'area_ha = Math.round(this.area / 10000)' ${output('out.geojson')}`,
    event.id,
  );
  const season = SEASON_LABEL[event.season];
  write(event.id, result['out.geojson'], {
    group: 'flood-event',
    title: `${season} ${event.year} floods${event.place ? `, ${event.place}` : ''}${event.note ? ` (${event.note})` : ''}`,
    season: event.season,
    year: event.year,
    date: event.date ?? null,
    river: event.river ?? 'juba-shabelle',
    source: event.layer ? SWALIM : `${SWALIM} (source to confirm)`,
    sourceUrl: event.layer ? swalimUrl(event.layer) : null,
  });
}

// Reference flood layers ---------------------------------------------------------
const reference = [
  {
    id: 'flood-plain-2013-2023',
    title: 'Flood plain extent 2013–2023 (Sentinel-2)',
    file: `${RECENT}/Somalia Flood Plain Extent_ 2013–2023 (Sentinel-2 Derived/2e60b6f6-04fe-429b-ab1f-ed42c6eeb270/som_historical_floods_2013_2023_extents_dissolve.shp`,
    commands: `-each 'type = "Flood plain"' -filter-fields type -dissolve2 type -simplify interval=${DETAIL.plain} keep-shapes -filter-slivers min-area=20000 -each 'area_ha = Math.round(this.area / 10000)'`,
    source: `${SWALIM} (source to confirm)`,
  },
  {
    id: 'flood-prone-areas-2020',
    title: 'Flood-prone areas (2020)',
    file: `${FLOODS}/9/Som_Flood_Prone_areas_20200.shp`,
    layer: 'Som_Flood_Prone_areas_20200',
    commands: `-each 'type = "Flood-prone area"' -filter-fields type -dissolve2 type -simplify interval=${DETAIL.plain} keep-shapes -filter-slivers min-area=20000 -each 'area_ha = Math.round(this.area / 10000)'`,
  },
  {
    id: 'flooded-farmland-2018',
    title: 'Flooded agricultural areas (2018)',
    file: `${FLOODS}/11/SOM_Flooded_Agriculture_Areas_FAOSWALIM2018.shp`,
    layer: 'SOM_Flooded_Agriculture_Areas_FAOSWALIM2018',
    commands: `-each 'type = Class === "Irrigated" ? "Irrigated" : "Rainfed"' -filter-fields type -dissolve2 type -simplify interval=${DETAIL.flood} keep-shapes -each 'area_ha = Math.round(this.area / 10000)'`,
  },
  {
    id: 'rivers',
    title: 'Juba and Shabelle rivers',
    file: `${FLOODS}/5/SOM_Rivers_Juba_shabelle_line_FAOSWALIM.shp`,
    layer: 'SOM_Rivers_Juba_shabelle_line_FAOSWALIM',
    // "name" is a reserved word in -dissolve, so the field is called "river".
    commands: `-filter 'NAME === "Shabelle River" || NAME === "Juba River"' -each 'river = NAME' -filter-fields river -dissolve river -simplify interval=${DETAIL.river}`,
  },
  {
    id: 'river-gauging-stations',
    title: 'River gauging stations',
    file: `${FLOODS}/21/SOM_River_Gauging_Stations_FAOSWALIM3.shp`,
    layer: 'SOM_River_Gauging_Stations_FAOSWALIM3',
    commands: `-each 'name = NAME, river = RIVER, status = Status' -filter-fields name,river,status`,
  },
  {
    id: 'rainfall-stations',
    title: 'Rainfall stations (2007)',
    file: `${FLOODS}/20/SOM_Rainfall_Stations_FAOSWALIM_2007.shp`,
    layer: 'SOM_Rainfall_Stations_FAOSWALIM_2007',
    commands: `-each 'name = NAME.replace(/_/g, " "), region = REGION, district = DISTRICT, status = STAT, type = Stn_Type' -filter-fields name,region,district,status,type`,
  },
  {
    id: 'barrages-bridges',
    title: 'River barrages and bridges',
    file: `${FLOODS}/12/SOM_River_Barrage_Bridge_FAOSWALIM.shp`,
    layer: 'SOM_River_Barrage_Bridge_FAOSWALIM',
    commands: `-points x=X_coord y=Y_coord -each 'name = Name, river = RiverName, type = Type, district = District, built = YearOfEsta || null' -filter-fields name,river,type,district,built`,
  },
  {
    id: 'river-breakages-2020-02',
    title: 'River breakage points (February 2020)',
    file: `${FLOODS}/14/Shabelle_Juba_Feb_2020FRRMIS.shp`,
    layer: 'Shabelle_Juba_Feb_2020FRRMIS',
    commands: `-each 'settlement = Settlement, district = District, region = Region, river = RIVER, status = STATUS, bank = LeftRight, width_m = Width_m, image_date = Image_Date, comment = Comment' -filter-fields settlement,district,region,river,status,bank,width_m,image_date,comment`,
  },
  {
    id: 'river-breakages-2020-08',
    title: 'River breakage points (August 2020)',
    file: `${FLOODS}/2/Shabelle_Juba_Aug_2020FRRMIS_.shp`,
    layer: 'Shabelle_Juba_Aug_2020FRRMIS_',
    commands: `-each 'settlement = Settlement, district = District, region = Region, river = RIVER, status = STATUS, bank = LeftRight, width_m = Width_m, image_date = Image_Date, comment = Comment, category = Category' -filter-fields settlement,district,region,river,status,bank,width_m,image_date,comment,category`,
  },
];

for (const layer of reference) {
  const result = await run(`${input(layer.file)} ${layer.commands} ${output('out.geojson')}`, layer.id);
  write(layer.id, result['out.geojson'], {
    group: 'flood-reference',
    title: layer.title,
    source: layer.source ?? SWALIM,
    sourceUrl: layer.layer ? swalimUrl(layer.layer) : null,
  });
}

// Drought conditions ------------------------------------------------------------
const droughtParts = [];
for (const [name, folder] of DROUGHT_FILES) {
  const [, monthName, year] = name.match(/_([A-Z][a-z]+)_(\d{4})$/) ?? [];
  const month = `${year}-${MONTHS[monthName]}`;
  const result = await run(
    `${input(`${DROUGHTS}/${folder}/${name}.shp`)} -each 'drought = Drought' -filter-fields drought ` +
      `-dissolve2 drought -simplify interval=${DETAIL.drought} keep-shapes -filter-slivers min-area=1000000 ` +
      `-each 'month = "${month}"' ${output('out.geojson')}`,
    name,
  );
  const fc = JSON.parse(result['out.geojson']);
  for (const feature of fc.features) {
    const value = String(feature.properties.drought ?? '').trim();
    const match = DROUGHT_CLASSES.find((c) => c.toLowerCase() === value.toLowerCase());
    if (!match) problems.push(`${name}: unknown drought class "${value}"`);
    if (!feature.geometry) {
      // A sliver smaller than the simplification (e.g. 2.7 km² in January 2017).
      notes.push(`${month}: "${match ?? value}" area too small to draw at map scale, left out`);
      continue;
    }
    feature.properties = { month, drought: match ?? value, layer: name };
    droughtParts.push(feature);
  }
}
const months = [...new Set(droughtParts.map((f) => f.properties.month))].sort();
write(
  'drought-conditions',
  JSON.stringify({ type: 'FeatureCollection', features: droughtParts }),
  {
    group: 'drought',
    title: 'Drought conditions by month',
    months,
    classes: DROUGHT_CLASSES,
    source: SWALIM,
    sourceUrl: 'https://spatial.faoswalim.org/',
  },
);

manifest.notes = notes;
writeFileSync(join(OUT, 'index.json'), JSON.stringify(manifest, null, 2));
if (notes.length) console.log(`Notes:\n  ${notes.join('\n  ')}`);
const totalKB = manifest.layers.reduce((sum, l) => sum + l.sizeKB, 0);
console.log(`\n${manifest.layers.length} layers, ${(totalKB / 1024).toFixed(1)} MB in public/data/watch`);
if (problems.length) {
  console.log(`Check:\n  ${problems.join('\n  ')}`);
  process.exitCode = 1;
}
