import { describe, expect, it } from 'vitest';
import { regionCenter } from './region-coordinates';

describe('regionCenter', () => {
  it('returns the named drought-response place centers', () => {
    expect(regionCenter('ceelgula')).toEqual({ lat: 6.01175, lng: 47.85248 });
    expect(regionCenter('baydhaba')).toEqual({ lat: 3.119951, lng: 43.644462 });
    expect(regionCenter('xuduley')).toEqual({ lat: 3.31305, lng: 45.66508 });
    expect(regionCenter('far-libaax')).toEqual({ lat: 4.87458, lng: 44.86873 });
    expect(regionCenter('lower-juba')).toEqual({ lat: 0.07222, lng: 42.75056 });
  });
});
