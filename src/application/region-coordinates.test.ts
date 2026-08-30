import { describe, expect, it } from 'vitest';
import { regionCenter } from './region-coordinates';

describe('regionCenter', () => {
  it('returns the district center used for each drought-response region', () => {
    expect(regionCenter('mudug')).toEqual({ lat: 5.3516, lng: 48.5256 });
    expect(regionCenter('bay')).toEqual({ lat: 3.1138, lng: 43.6498 });
    expect(regionCenter('hiraan')).toEqual({ lat: 4.7358, lng: 45.2036 });
    expect(regionCenter('lower-juba')).toEqual({ lat: -0.3566, lng: 42.5453 });
  });
});
