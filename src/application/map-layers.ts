import type { StyleSpecification } from 'maplibre-gl';

export type MapLayerId = 'osm' | 'terrain' | 'satellite';

export type MapLayer = {
  id: MapLayerId;
  label: string;
};

export const MAP_LAYERS: MapLayer[] = [
  { id: 'osm', label: 'OpenStreetMap' },
  { id: 'terrain', label: 'Terrain' },
  { id: 'satellite', label: 'Satellite' },
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
    case 'osm':
    default:
      return rasterStyle(
        ['a', 'b', 'c'].map((s) => `https://${s}.tile.openstreetmap.org/{z}/{x}/{y}.png`),
        OSM_ATTR,
      );
  }
};
