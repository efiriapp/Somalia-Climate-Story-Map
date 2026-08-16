import type { StyleSpecification } from 'maplibre-gl';

export type MapLayerId = 'carto-voyager' | 'carto-dark' | 'osm' | 'satellite';

export type MapLayer = {
  id: MapLayerId;
  label: string;
};

export const MAP_LAYERS: MapLayer[] = [
  { id: 'carto-voyager', label: 'Carto Voyager 3D' },
  { id: 'carto-dark', label: 'Carto Dark Globe' },
  { id: 'osm', label: 'OpenStreetMap' },
  { id: 'satellite', label: 'Satellite 3D' },
];

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
  layers: [{ id: 'basemap', type: 'raster', source: 'basemap' }],
});

export const styleForLayer = (id: MapLayerId): StyleSpecification => {
  switch (id) {
    case 'carto-dark':
      return rasterStyle(
        ['a', 'b', 'c', 'd'].map(
          (s) => `https://${s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png`,
        ),
        '© CARTO © OpenStreetMap contributors',
      );
    case 'osm':
      return rasterStyle(
        ['a', 'b', 'c'].map((s) => `https://${s}.tile.openstreetmap.org/{z}/{x}/{y}.png`),
        '© OpenStreetMap contributors',
      );
    case 'satellite':
      return rasterStyle(
        ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
        'Tiles © Esri',
      );
    case 'carto-voyager':
    default:
      return rasterStyle(
        ['a', 'b', 'c', 'd'].map(
          (s) => `https://${s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png`,
        ),
        '© CARTO © OpenStreetMap contributors',
      );
  }
};
