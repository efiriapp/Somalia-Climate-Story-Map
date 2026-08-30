import { describe, expect, it } from 'vitest';
import { districtCenter } from './district-coordinates';

describe('districtCenter', () => {
  it('returns the geographic center of drought-response districts', () => {
    expect(districtCenter('hobyo')).toEqual({ lat: 5.3516, lng: 48.5256 });
    expect(districtCenter('baidoa')).toEqual({ lat: 3.1138, lng: 43.6498 });
    expect(districtCenter('jalalaqsi')).toEqual({ lat: 3.3769, lng: 45.5994 });
    expect(districtCenter('belet-weyne')).toEqual({ lat: 4.7358, lng: 45.2036 });
    expect(districtCenter('kismaayo')).toEqual({ lat: -0.3566, lng: 42.5453 });
  });
});
