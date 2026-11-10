import type { StyleSpecification } from 'maplibre-gl';
import { describe, expect, it } from 'vitest';
import { DEFAULT_MAP_LAYER, MAP_LAYERS, basemapFor, withHillshade } from './map-layers';

const paidOrKeyedTiles = /cartocdn|mapbox|stadiamaps|maptiler|thunderforest|googleapis|arcgisonline|World_Imagery|api_key|access_token/i;

describe('map layers', () => {
  it('defaults to Streets and offers Satellite and Terrain in the toggle', () => {
    expect(DEFAULT_MAP_LAYER).toBe('streets');
    expect(MAP_LAYERS.map((layer) => layer.id)).toEqual(['streets', 'satellite', 'terrain']);
  });

  it('uses OpenFreeMap vector streets with credit, without paid or keyed services', () => {
    const streets = basemapFor('streets');
    expect(streets.style).toBe('https://tiles.openfreemap.org/styles/liberty');
    expect(streets.attribution).toContain('OpenStreetMap');
    expect(JSON.stringify(streets)).not.toMatch(paidOrKeyedTiles);
  });

  it('uses the CC BY 2016 Sentinel-2 cloudless layer, not the non-commercial later years', () => {
    const satellite = basemapFor('satellite');
    const json = JSON.stringify(satellite.style);
    expect(json).toContain('s2cloudless_3857');
    expect(json).not.toMatch(/s2cloudless-20(1[89]|2\d)/);
    expect(satellite.attribution).toContain('CC BY 4.0');
    expect(json).not.toMatch(paidOrKeyedTiles);
  });

  it('builds Terrain from the streets style plus hillshading', () => {
    const terrain = basemapFor('terrain');
    expect(terrain.style).toBe(basemapFor('streets').style);
    expect(terrain.transform).toBe(withHillshade);
    expect(terrain.attribution).toContain('Terrain Tiles');
  });
});

describe('withHillshade', () => {
  it('adds a terrarium DEM source and puts hillshade below the first label layer', () => {
    const style: StyleSpecification = {
      version: 8,
      sources: {},
      layers: [
        { id: 'bg', type: 'background' },
        { id: 'roads', type: 'background' },
        { id: 'labels', type: 'symbol', source: 'x' },
      ],
    };
    const shaded = withHillshade(style);
    expect(shaded.sources['terrain-dem']).toMatchObject({ type: 'raster-dem', encoding: 'terrarium' });
    expect(shaded.layers.map((layer) => layer.id)).toEqual(['bg', 'roads', 'terrain-hillshade', 'labels']);
    expect(style.layers).toHaveLength(3);
  });
});
