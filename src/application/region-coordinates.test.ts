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

  it('returns the Green Champions outreach places', () => {
    expect(regionCenter('liido-beach')).toEqual({ lat: 2.037, lng: 45.347 });
    expect(regionCenter('mogadishu-primary-school')).toEqual({ lat: 2.0223, lng: 45.2974 });
    expect(regionCenter('boondheere-orphan-girls')).toEqual({ lat: 2.0448, lng: 45.3406 });
    expect(regionCenter('wadajir')).toEqual({ lat: 2.0469, lng: 45.3182 });
  });
});
