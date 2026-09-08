import { describe, expect, it } from 'vitest';
import {
  EQUAL_EARTH_ATTRIBUTION,
  EQUAL_EARTH_STYLE_URL,
  EQUAL_EARTH_SWITCH_ZOOM,
} from './equal-earth';

describe('equal-earth', () => {
  it('points every map at the free Equal Earth hybrid style', () => {
    expect(EQUAL_EARTH_STYLE_URL).toContain('equal.bbox.earth');
    expect(EQUAL_EARTH_STYLE_URL).toContain('eq2merc');
    expect(EQUAL_EARTH_SWITCH_ZOOM).toBe(3);
    expect(EQUAL_EARTH_ATTRIBUTION).toMatch(/Equal Earth/i);
    expect(EQUAL_EARTH_STYLE_URL).not.toMatch(/cartocdn|mapbox|stadiamaps|maptiler/i);
  });
});
