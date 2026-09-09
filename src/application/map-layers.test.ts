import { describe, expect, it } from 'vitest';
import { DEFAULT_MAP_LAYER, MAP_LAYERS, styleForLayer } from './map-layers';

const paidOrKeyedTiles = /cartocdn|mapbox|stadiamaps|maptiler|thunderforest|googleapis|arcgisonline|World_Imagery/i;

describe('map layers', () => {
  it('defaults to Streets and offers Satellite and Terrain in the toggle', () => {
    expect(DEFAULT_MAP_LAYER).toBe('streets');
    expect(MAP_LAYERS.map((layer) => layer.id)).toEqual(['streets', 'satellite', 'terrain']);
    expect(MAP_LAYERS[0]?.label).toBe('Streets');
    expect(MAP_LAYERS.map((layer) => layer.label).join(' ')).not.toMatch(/Carto/i);
  });

  it('builds a Streets style without Carto or paid tile APIs', () => {
    const json = JSON.stringify(styleForLayer('streets'));
    expect(json).toContain('tile.openstreetmap.org');
    expect(json).toContain('#063D39');
    expect(json).not.toMatch(paidOrKeyedTiles);
  });

  it('builds Terrain and Satellite styles from free tiles', () => {
    expect(JSON.stringify(styleForLayer('terrain'))).toContain('opentopomap.org');
    const satellite = JSON.stringify(styleForLayer('satellite'));
    expect(satellite).toContain('s2cloudless');
    expect(satellite).not.toMatch(paidOrKeyedTiles);
  });
});
