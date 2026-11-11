import { describe, expect, it } from 'vitest';
import { makeLocator, pixelAreaHa } from './geo-stats.mjs';

describe('pixelAreaHa', () => {
  it('gives the ground area of a 0.00025° Hansen pixel (about 30 m)', () => {
    // 27.8 m × 27.8 m at the equator.
    expect(pixelAreaHa(0, 0.00025)).toBeCloseTo(0.0773, 3);
    // Narrower further from the equator.
    expect(pixelAreaHa(10, 0.00025)).toBeCloseTo(0.0773 * Math.cos((10 * Math.PI) / 180), 3);
  });
});

describe('makeLocator', () => {
  const square = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]];
  const features = [
    // A polygon with a hole.
    { properties: { id: 'a' }, geometry: { type: 'Polygon', coordinates: [square(0, 0, 4, 4), square(1, 1, 2, 2)] } },
    // Two separate parts.
    { properties: { id: 'b' }, geometry: { type: 'MultiPolygon', coordinates: [[square(5, 0, 6, 1)], [square(7, 0, 8, 1)]] } },
  ];
  const locate = makeLocator(features, (f) => f.properties.id);

  it('finds the unit a point is in', () => {
    expect(locate(3, 3)).toBe('a');
    expect(locate(7.5, 0.5)).toBe('b');
  });

  it('returns null outside every unit, including holes (only data inside Somalia)', () => {
    expect(locate(1.5, 1.5)).toBeNull();
    expect(locate(6.5, 0.5)).toBeNull();
    expect(locate(-1, -1)).toBeNull();
  });
});
