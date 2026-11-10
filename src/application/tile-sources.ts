/**
 * One place for every basemap source, shared by the MapLibre globe and the
 * Leaflet story maps. All defaults are free, need no account or API key, and
 * allow public production use:
 *
 * - Streets: OpenFreeMap vector tiles (OpenStreetMap data), "liberty" style.
 *   https://openfreemap.org — free public instance, no view or request limits.
 * - Satellite: EOX Sentinel-2 cloudless 2016, CC BY 4.0 (commercial use OK
 *   with attribution). Newer EOX years are CC BY-NC-SA, so they are not used.
 * - Terrain: the streets style with hillshading from AWS Terrain Tiles
 *   (Mapzen/Tilezen, Registry of Open Data on AWS), attribution required.
 *
 * Each can be replaced at build time (see .env.example), e.g. a self-hosted
 * OpenFreeMap or Protomaps server:
 *   VITE_MAP_STYLE_URL=https://maps.example.org/styles/liberty
 */
export type TileLayerId = 'streets' | 'satellite' | 'terrain';

export type RasterSource = {
  /** Template URL with {z}/{x}/{y} and optional {s}. */
  url: string;
  /** Plain-text attribution. */
  attribution: string;
};

type EnvLike = Record<string, string | boolean | undefined>;

const envValue = (env: EnvLike, key: string): string | undefined => {
  const value = env[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
};

const OPENFREEMAP_ATTRIBUTION = 'OpenFreeMap © OpenMapTiles · Data © OpenStreetMap contributors';

/** Vector style used for Streets and as the base of Terrain. */
export const streetsStyle = (env: EnvLike = import.meta.env): { url: string; attribution: string } => ({
  url: envValue(env, 'VITE_MAP_STYLE_URL') ?? 'https://tiles.openfreemap.org/styles/liberty',
  attribution: envValue(env, 'VITE_MAP_STYLE_ATTRIBUTION') ?? OPENFREEMAP_ATTRIBUTION,
});

export const satelliteSource = (env: EnvLike = import.meta.env): RasterSource => ({
  url:
    envValue(env, 'VITE_TILES_SATELLITE_URL') ??
    'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg',
  attribution:
    envValue(env, 'VITE_TILES_SATELLITE_ATTRIBUTION') ??
    'Sentinel-2 cloudless – s2maps.eu by EOX IT Services GmbH (contains modified Copernicus Sentinel data 2016 & 2017), CC BY 4.0',
});

/** Terrarium-encoded elevation tiles for hillshading. */
export const terrainDemSource = (env: EnvLike = import.meta.env): RasterSource => ({
  url:
    envValue(env, 'VITE_TERRAIN_DEM_URL') ??
    'https://elevation-tiles-prod.s3.amazonaws.com/terrarium/{z}/{x}/{y}.png',
  attribution:
    envValue(env, 'VITE_TERRAIN_DEM_ATTRIBUTION') ??
    'Elevation: Terrain Tiles (Mapzen/Tilezen) via Registry of Open Data on AWS',
});

/** MapLibre has no {s} placeholder, so expand it into one URL per subdomain. */
export const expandSubdomains = (url: string): string[] =>
  url.includes('{s}') ? ['a', 'b', 'c'].map((s) => url.replace('{s}', s)) : [url];
