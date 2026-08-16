import { describe, expect, it } from 'vitest';
import { MAP_LAYERS, styleForLayer } from './map-layers';

describe('map layers', () => {
  it('offers free Carto, OSM, and satellite globe layers', () => {
    expect(MAP_LAYERS.map((layer) => layer.id)).toEqual([
      'carto-voyager',
      'carto-dark',
      'osm',
      'satellite',
    ]);
  });

  it('builds a Carto Voyager style', () => {
    const style = styleForLayer('carto-voyager');
    expect(JSON.stringify(style)).toContain('basemaps.cartocdn.com');
  });

  it('builds a satellite style', () => {
    const style = styleForLayer('satellite');
    expect(JSON.stringify(style)).toContain('World_Imagery');
  });
});
