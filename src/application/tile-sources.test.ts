import { describe, expect, it } from 'vitest';
import { expandSubdomains, satelliteSource, streetsStyle, terrainDemSource } from './tile-sources';

describe('tile sources', () => {
  it('defaults to free services that need no key', () => {
    expect(streetsStyle({}).url).toBe('https://tiles.openfreemap.org/styles/liberty');
    expect(satelliteSource({}).url).toContain('s2cloudless_3857');
    expect(terrainDemSource({}).url).toContain('elevation-tiles-prod');
  });

  it('lets build-time variables replace a source and its credit', () => {
    const env = {
      VITE_MAP_STYLE_URL: 'https://maps.example.org/styles/liberty',
      VITE_MAP_STYLE_ATTRIBUTION: '© Example',
      VITE_TILES_SATELLITE_URL: 'https://sat.example.org/{z}/{x}/{y}.jpg',
    };
    expect(streetsStyle(env)).toEqual({ url: 'https://maps.example.org/styles/liberty', attribution: '© Example' });
    expect(satelliteSource(env).url).toBe('https://sat.example.org/{z}/{x}/{y}.jpg');
    expect(satelliteSource(env).attribution).toContain('EOX');
  });

  it('ignores blank overrides', () => {
    expect(streetsStyle({ VITE_MAP_STYLE_URL: '  ' }).url).toContain('openfreemap');
  });
});

describe('expandSubdomains', () => {
  it('expands {s} into a, b and c and leaves other URLs alone', () => {
    expect(expandSubdomains('https://{s}.t.org/{z}')).toEqual([
      'https://a.t.org/{z}',
      'https://b.t.org/{z}',
      'https://c.t.org/{z}',
    ]);
    expect(expandSubdomains('https://t.org/{z}')).toEqual(['https://t.org/{z}']);
  });
});
