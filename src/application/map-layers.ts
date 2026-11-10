import type { LayerSpecification, StyleSpecification } from 'maplibre-gl';
import { expandSubdomains, satelliteSource, streetsStyle, terrainDemSource } from './tile-sources';

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

/** What a map needs to show a basemap: a style (URL or object), an optional edit, and the credit. */
export type BasemapStyle = {
  style: StyleSpecification | string;
  /** Applied to the loaded style (MapLibre `setStyle(..., { transformStyle })`). */
  transform?: (style: StyleSpecification) => StyleSpecification;
  attribution: string;
};

const satelliteStyle = (): StyleSpecification => {
  const source = satelliteSource();
  return {
    version: 8,
    sources: {
      basemap: {
        type: 'raster',
        tiles: expandSubdomains(source.url),
        tileSize: 256,
        maxzoom: 15,
        attribution: source.attribution,
      },
    },
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': '#063D39' } },
      { id: 'basemap', type: 'raster', source: 'basemap' },
    ],
  };
};

/** Adds hillshading under the first label layer of a vector style. */
export const withHillshade = (style: StyleSpecification): StyleSpecification => {
  const dem = terrainDemSource();
  const hillshade: LayerSpecification = {
    id: 'terrain-hillshade',
    type: 'hillshade',
    source: 'terrain-dem',
    paint: {
      'hillshade-exaggeration': 0.6,
      'hillshade-shadow-color': '#3d4a3f',
      'hillshade-highlight-color': '#ffffff',
    },
  };
  const firstLabel = style.layers.findIndex((layer) => layer.type === 'symbol');
  const at = firstLabel === -1 ? style.layers.length : firstLabel;
  return {
    ...style,
    sources: {
      ...style.sources,
      'terrain-dem': {
        type: 'raster-dem',
        tiles: expandSubdomains(dem.url),
        encoding: 'terrarium',
        tileSize: 256,
        maxzoom: 14,
        attribution: dem.attribution,
      },
    },
    layers: [...style.layers.slice(0, at), hillshade, ...style.layers.slice(at)],
  };
};

/** Basemap for a layer; sources and licences are documented in tile-sources.ts. */
export const basemapFor = (id: MapLayerId): BasemapStyle => {
  const streets = streetsStyle();
  switch (id) {
    case 'satellite':
      return { style: satelliteStyle(), attribution: satelliteSource().attribution };
    case 'terrain':
      return {
        style: streets.url,
        transform: withHillshade,
        attribution: `${streets.attribution} · ${terrainDemSource().attribution}`,
      };
    case 'streets':
    default:
      return { style: streets.url, attribution: streets.attribution };
  }
};
