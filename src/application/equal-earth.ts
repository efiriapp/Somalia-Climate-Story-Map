import type { StyleSpecification } from 'maplibre-gl';
import type { MapLayerId } from './map-layers';

/** Hybrid Equal Earth / Mercator vector tilejson (z0–2 Equal Earth, z≥3 Mercator grid). */
export const EQUAL_EARTH_COUNTRIES_TILEJSON =
  'https://assets.bbox.earth/tiles/ne_extracts_8857_3857/ne_countries.json';

/** Zoom at which EqualEarthCoordTransform switches from Equal Earth to Mercator tile math. */
export const EQUAL_EARTH_SWITCH_ZOOM = 3;

export const EQUAL_EARTH_ATTRIBUTION =
  'Equal Earth · OpenStreetMap · Natural Earth · <a href="https://equal.bbox.earth/">equal.bbox.earth</a>';

const RASTER_BY_LAYER: Record<
  MapLayerId,
  { tiles: string[]; attribution: string; sourceId: string; layerId: string }
> = {
  terrain: {
    sourceId: 'terrain',
    layerId: 'terrain',
    tiles: ['a', 'b', 'c'].map((s) => `https://${s}.tile.opentopomap.org/{z}/{x}/{y}.png`),
    attribution: '© OpenStreetMap contributors, SRTM | © OpenTopoMap (CC-BY-SA)',
  },
  satellite: {
    sourceId: 'satellite',
    layerId: 'satellite',
    tiles: ['https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2021_3857/default/g/{z}/{y}/{x}.jpg'],
    attribution: 'Sentinel-2 cloudless by EOX · Copernicus open data',
  },
  streets: {
    sourceId: 'streets',
    layerId: 'streets',
    tiles: ['a', 'b', 'c'].map((s) => `https://${s}.tile.openstreetmap.org/{z}/{x}/{y}.png`),
    attribution: '© OpenStreetMap contributors',
  },
};

/**
 * Equal Earth hybrid look: Natural Earth countries below the switch zoom,
 * chosen Mercator raster (Streets default) for higher zooms.
 * Keeps EqualEarthCoordTransform while avoiding a blank NE-only style.
 */
export const equalEarthStyle = (basemap: MapLayerId = 'streets'): StyleSpecification => {
  const raster = RASTER_BY_LAYER[basemap];
  return {
    version: 8,
    name: `equal-earth-${basemap}`,
    sources: {
      countries: {
        type: 'vector',
        url: EQUAL_EARTH_COUNTRIES_TILEJSON,
        attribution: EQUAL_EARTH_ATTRIBUTION,
      },
      [raster.sourceId]: {
        type: 'raster',
        tiles: raster.tiles,
        tileSize: 256,
        attribution: raster.attribution,
      },
    },
    glyphs: 'https://assets.bbox.earth/fonts/{fontstack}/{range}.pbf',
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: { 'background-color': '#8fad7e' },
      },
      {
        id: 'country-fill',
        type: 'fill',
        source: 'countries',
        'source-layer': 'country',
        maxzoom: EQUAL_EARTH_SWITCH_ZOOM,
        paint: {
          'fill-color': [
            'match',
            ['get', 'mapcolor7'],
            1,
            '#c5d6a4',
            2,
            '#b8c98f',
            3,
            '#d4c98a',
            4,
            '#a8c9a0',
            5,
            '#9bbf8c',
            6,
            '#8fb8a8',
            7,
            '#b5a8b0',
            '#a8c9a0',
          ],
        },
      },
      {
        id: 'land-border-country',
        type: 'line',
        source: 'countries',
        'source-layer': 'land-border-country',
        maxzoom: EQUAL_EARTH_SWITCH_ZOOM,
        paint: {
          'line-color': '#f4f7ef',
          'line-width': ['interpolate', ['linear'], ['zoom'], 0, 0.6, 2, 1],
        },
      },
      {
        id: 'geo-lines',
        type: 'line',
        source: 'countries',
        'source-layer': 'geo-lines',
        maxzoom: EQUAL_EARTH_SWITCH_ZOOM,
        paint: {
          'line-color': '#4a6b4a',
          'line-width': ['interpolate', ['linear'], ['zoom'], 0, 0.2, 3, 0.8],
          'line-dasharray': [6, 2],
          'line-opacity': 0.45,
        },
      },
      {
        id: raster.layerId,
        type: 'raster',
        source: raster.sourceId,
        minzoom: EQUAL_EARTH_SWITCH_ZOOM,
      },
    ],
  };
};
