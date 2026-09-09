import { describe, expect, it } from 'vitest';
import { leafletBasemaps } from './leaflet-basemaps';

describe('leafletBasemaps', () => {
  it('lists Streets first, then Satellite and Terrain, without paid tile APIs', () => {
    expect(leafletBasemaps.map((layer) => layer.id)).toEqual(['streets', 'satellite', 'terrain']);
    expect(leafletBasemaps[0]?.url).toContain('tile.openstreetmap.org');
    expect(leafletBasemaps[1]?.url).toContain('s2cloudless');
    expect(leafletBasemaps[2]?.url).toContain('tile.opentopomap.org');
    expect(leafletBasemaps.map((layer) => layer.url).join(' ')).not.toMatch(
      /cartocdn|mapbox|stadiamaps|maptiler|arcgisonline|World_Imagery/i,
    );
  });
});
