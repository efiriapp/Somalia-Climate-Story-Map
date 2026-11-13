/**
 * UNOCHA Somalia administrative boundaries (via FAO SWALIM), shared by the
 * data scripts: where the shapefiles are, their id/name fields, and the
 * short state names and ids the site uses (flags, labels, charts).
 */
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT } from './flood-events.mjs';

const BOUNDARIES = join(ROOT, 'Sources', 'Data', 'boundaries');
const UNZIPPED = join(BOUNDARIES, 'unzipped');
/** Equal-area projection centred on Somalia (WGS 84): areas measured in it are true ground areas. */
export const LAEA = '+proj=laea +lat_0=5 +lon_0=46 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs';

export const LEVELS = {
  state: { zip: 'SOM_Adminbnda_Adm1_States_UNOCHA', id: 'Name', name: 'Name' },
  region: { zip: 'SOM_Adminbnda_Adm2_Regions_UNOCHA', id: 'admin1Pcod', name: 'admin1Name' },
  district: { zip: 'SOM_Adminbnda_Adm3_Districts_UNOCHA', id: 'admin2Pcod', name: 'admin2Name', parent: 'admin1Pcod' },
};

/** Short names and flag ids for the UNOCHA state names. */
export const STATE = {
  Somaliland: { id: 'somaliland', name: 'Somaliland' },
  Puntland: { id: 'puntland', name: 'Puntland' },
  'Galmudug Administration': { id: 'galmudug', name: 'Galmudug' },
  Hirshabelle: { id: 'hirshabelle', name: 'Hirshabelle' },
  'South West Administration': { id: 'south-west', name: 'South West' },
  'Jubaland Administration': { id: 'jubaland', name: 'Jubaland' },
  Banadir: { id: 'banadir', name: 'Banadir' },
  // UNOCHA's 'border claims' area is administered by North Eastern State (SSC-Khatumo).
  'Somaliland-Puntland Border Claims': { id: 'north-eastern', name: 'North Eastern' },
};

/**
 * Path of `name`.shp from a zipped shapefile, unzipping it into `folder` the
 * first time. Fails fast when the zip is missing.
 */
export const shapefileFrom = (archive, folder, name) => {
  const file = join(folder, `${name}.shp`);
  if (!existsSync(file)) {
    if (!existsSync(archive)) throw new Error(`Missing ${archive}`);
    mkdirSync(folder, { recursive: true });
    // tar reads zip files on Windows 10+, macOS and most Linux systems.
    execFileSync('tar', ['-xf', archive, '-C', folder]);
  }
  return file;
};

export const shp = (level) => {
  const { zip } = LEVELS[level];
  return shapefileFrom(join(BOUNDARIES, `${zip}.zip`), join(UNZIPPED, zip), zip);
};

