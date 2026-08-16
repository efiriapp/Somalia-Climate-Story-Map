import { describe, expect, it } from 'vitest';
import { DISTRICTS, REGIONS, districtsForRegion, searchByLabel } from './somalia';

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

  it('returns only Bari districts when Bari is selected', () => {
    const bari = districtsForRegion('bari');
    expect(bari.map((district) => district.slug).sort()).toEqual([
      'bandarbayla',
      'bossaso',
      'caluula',
      'iskushuban',
      'qandala',
      'qardho',
    ]);
    expect(bari.every((district) => district.region === 'bari')).toBe(true);
  });

  it('searches regions by typed name', () => {
    expect(searchByLabel(REGIONS, 'bari').map((region) => region.slug)).toEqual(['bari']);
  });

  it('searches only the districts of the chosen region', () => {
    const results = searchByLabel(districtsForRegion('bari'), 'bo');
    expect(results.map((district) => district.slug)).toEqual(['bossaso']);
    expect(results.every((district) => district.region === 'bari')).toBe(true);
  });
});
