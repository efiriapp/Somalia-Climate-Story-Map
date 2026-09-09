import { describe, expect, it } from 'vitest';
import {
  EQUAL_EARTH_ATTRIBUTION,
  EQUAL_EARTH_COUNTRIES_TILEJSON,
  EQUAL_EARTH_SWITCH_ZOOM,
  equalEarthStyle,
} from './equal-earth';

describe('equal-earth', () => {
  it('defaults to Equal Earth + streets hybrid without keyed tile APIs', () => {
    const style = equalEarthStyle();
    const json = JSON.stringify(style);
    expect(style.name).toBe('equal-earth-streets');
    expect(EQUAL_EARTH_COUNTRIES_TILEJSON).toContain('assets.bbox.earth');
    expect(EQUAL_EARTH_SWITCH_ZOOM).toBe(3);
    expect(EQUAL_EARTH_ATTRIBUTION).toMatch(/Equal Earth/i);
    expect(json).toContain('tile.openstreetmap.org');
    expect(json).toContain('ne_extracts_8857_3857');
    expect(json).toContain('"minzoom":3');
    expect(json).not.toMatch(/#ffffff|"#fff"/i);
    expect(json).not.toMatch(/cartocdn|mapbox|stadiamaps|maptiler/i);
  });

  it('builds satellite and terrain hybrids that keep Equal Earth countries below the switch zoom', () => {
    const satellite = JSON.stringify(equalEarthStyle('satellite'));
    const terrain = JSON.stringify(equalEarthStyle('terrain'));
    expect(satellite).toContain('s2cloudless');
    expect(satellite).toContain('ne_extracts_8857_3857');
    expect(terrain).toContain('opentopomap.org');
    expect(terrain).toContain('ne_extracts_8857_3857');
  });
});
