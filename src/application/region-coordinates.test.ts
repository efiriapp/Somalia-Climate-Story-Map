import { describe, expect, it } from 'vitest';
import { regionCenter } from './region-coordinates';

describe('regionCenter', () => {
  it('returns the center of each drought-response region', () => {
    expect(regionCenter('mudug')).toEqual({ lat: 6.1128, lng: 47.9881 });
    expect(regionCenter('bay')).toEqual({ lat: 3.05, lng: 43.75 });
    expect(regionCenter('hiraan')).toEqual({ lat: 4.783, lng: 45.45 });
    expect(regionCenter('lower-juba')).toEqual({ lat: -0.15, lng: 42.6 });
  });
});
