import type { StyleSpecification } from 'maplibre-gl';

export type MapLayerId = 'terrain' | 'satellite' | 'streets';

export type MapLayer = {
  id: MapLayerId;
  label: string;
};

/** Default basemap on every map surface. */
export const DEFAULT_MAP_LAYER: MapLayerId = 'streets';

export const MAP_LAYERS: MapLayer[] = [
  { id: 'streets', label: 'Streets' },
  { id: 'satellite', label: 'Satellite' },
  { id: 'terrain', label: 'Terrain' },
];

const OSM_ATTR = '© OpenStreetMap contributors';
const TERRAIN_ATTR = '© OpenStreetMap contributors, SRTM | © OpenTopoMap (CC-BY-SA)';
const SATELLITE_ATTR = 'Sentinel-2 cloudless by EOX · Copernicus open data';

const rasterStyle = (tiles: string[], attribution: string): StyleSpecification => ({
  version: 8,
  sources: {
    basemap: {
      type: 'raster',
      tiles,
      tileSize: 256,
      attribution,
    },
  },
  layers: [
    { id: 'background', type: 'background', paint: { 'background-color': '#063D39' } },
    { id: 'basemap', type: 'raster', source: 'basemap' },
  ],
});

/** Pure Mercator raster styles (no Equal Earth hybrid). Prefer equalEarthStyle for map surfaces. */
export const styleForLayer = (id: MapLayerId): StyleSpecification => {
  switch (id) {
    case 'terrain':
      return rasterStyle(
        ['a', 'b', 'c'].map((s) => `https://${s}.tile.opentopomap.org/{z}/{x}/{y}.png`),
        TERRAIN_ATTR,
      );
    case 'satellite':
      return rasterStyle(
        ['https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2021_3857/default/g/{z}/{y}/{x}.jpg'],
        SATELLITE_ATTR,
      );
    case 'streets':
    default:
      return rasterStyle(
        ['a', 'b', 'c'].map((s) => `https://${s}.tile.openstreetmap.org/{z}/{x}/{y}.png`),
        OSM_ATTR,
      );
  }
};
