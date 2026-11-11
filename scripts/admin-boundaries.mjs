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

export const shp = (level) => {
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

