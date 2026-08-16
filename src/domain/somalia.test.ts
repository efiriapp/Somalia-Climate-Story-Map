import { describe, expect, it } from 'vitest';
import { DISTRICTS, REGIONS, districtsForRegion } from './somalia';

describe('Somalia administrative units', () => {
  it('lists the 18 official regions', () => {
    expect(REGIONS).toHaveLength(18);
  });

  it('lists districts for every region and keeps each district on one region', () => {
    const regionSlugs = new Set(REGIONS.map((region) => region.slug));
    expect(DISTRICTS.length).toBeGreaterThanOrEqual(72);
    for (const district of DISTRICTS) {
      expect(regionSlugs.has(district.region)).toBe(true);
    }
  });

  it('returns only districts that belong to the selected region', () => {
    const banaadir = districtsForRegion('banaadir');
    expect(banaadir.length).toBeGreaterThan(10);
    expect(banaadir.every((district) => district.region === 'banaadir')).toBe(true);
  });

  it('returns every district when no region is selected', () => {
    expect(districtsForRegion('all')).toHaveLength(DISTRICTS.length);
  });
});
