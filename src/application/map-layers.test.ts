import { describe, expect, it } from 'vitest';
import { MAP_LAYERS, styleForLayer } from './map-layers';

const paidOrKeyedTiles = /cartocdn|mapbox|stadiamaps|maptiler|thunderforest|googleapis|arcgisonline|World_Imagery/i;

describe('map layers', () => {
  it('offers free OpenStreetMap, terrain, and satellite globe layers', () => {
    expect(MAP_LAYERS.map((layer) => layer.id)).toEqual(['osm', 'terrain', 'satellite']);
    expect(MAP_LAYERS.map((layer) => layer.label).join(' ')).not.toMatch(/Carto/i);
  });

  it('builds an OpenStreetMap style without Carto or paid tile APIs', () => {
    const json = JSON.stringify(styleForLayer('osm'));
    expect(json).toContain('tile.openstreetmap.org');
    expect(json).toContain('#063D39');
    expect(json).not.toMatch(paidOrKeyedTiles);
  });

  it('builds a satellite style from Copernicus Sentinel-2', () => {
    const json = JSON.stringify(styleForLayer('satellite'));
    expect(json).toContain('s2cloudless');
    expect(json).not.toMatch(paidOrKeyedTiles);
  });
});
