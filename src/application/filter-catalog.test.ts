import { describe, expect, it } from 'vitest';
import { filterCatalog } from './filter-catalog';
import { defaultFilterCriteria, type Story } from '../domain/story';

const story = (overrides: Partial<Story> & Pick<Story, 'id' | 'title'>): Story => ({
  type: 'ice-story',
  date: '2024-01-01',
  themes: ['youth'],
  sdgs: [13],
  region: 'banaadir',
  district: 'wadajir',
  location: { name: 'Mogadishu', lat: 2.05, lng: 45.32 },
  summary: 'A climate story.',
  body: 'Body text.',
  images: [],
  ...overrides,
});

const catalog: Story[] = [
  story({
    id: 'beach',
    title: 'Liido Beach Cleanup',
    themes: ['youth', 'oceans'],
    sdgs: [14, 13],
    date: '2025-06-01',
    district: 'abdiaziz',
    summary: 'Young Somalis reclaim the coast.',
  }),
  story({
    id: 'cop30',
    title: 'ICE Institute at COP30',
    type: 'global-stage',
    themes: ['policy-diplomacy'],
    sdgs: [13],
    date: '2026-01-01',
    region: '',
    district: '',
    summary: 'Somali voices at COP30 in Belém.',
    body: 'Climate diplomacy in Brazil.',
  }),
  story({
    id: 'ecosom',
    title: 'ECOSOM Waste to Energy',
    themes: ['waste-energy', 'green-enterprise'],
    sdgs: [7, 8],
    date: '2023-04-10',
    summary: 'Turning waste into clean energy.',
  }),
];

describe('filterCatalog', () => {
  it('defaults to every story, newest first', () => {
    const result = filterCatalog(catalog, defaultFilterCriteria());
    expect(result.map((item) => item.id)).toEqual(['cop30', 'beach', 'ecosom']);
  });

  it('filters by keyword across title, summary, and body', () => {
    const result = filterCatalog(catalog, {
      ...defaultFilterCriteria(),
      query: 'belém',
    });
    expect(result.map((item) => item.id)).toEqual(['cop30']);
  });

  it('filters by Somalia region', () => {
    const result = filterCatalog(catalog, {
      ...defaultFilterCriteria(),
      region: 'banaadir',
    });
    expect(result.map((item) => item.id)).toEqual(['beach', 'ecosom']);
  });

  it('filters by district', () => {
    const result = filterCatalog(catalog, {
      ...defaultFilterCriteria(),
      district: 'abdiaziz',
    });
    expect(result.map((item) => item.id)).toEqual(['beach']);
  });

  it('matches a story if any selected theme is present', () => {
    const result = filterCatalog(catalog, {
      ...defaultFilterCriteria(),
      themes: ['oceans', 'policy-diplomacy'],
    });
    expect(result.map((item) => item.id)).toEqual(['cop30', 'beach']);
  });

  it('matches a story if any selected SDG is present', () => {
    const result = filterCatalog(catalog, {
      ...defaultFilterCriteria(),
      sdgs: [7],
    });
    expect(result.map((item) => item.id)).toEqual(['ecosom']);
  });

  it('filters by calendar year', () => {
    const result = filterCatalog(catalog, {
      ...defaultFilterCriteria(),
      year: 2026,
    });
    expect(result.map((item) => item.id)).toEqual(['cop30']);
  });

  it('sorts by most keyword hits when requested', () => {
    const result = filterCatalog(catalog, {
      ...defaultFilterCriteria(),
      query: 'climate',
      sort: 'keywords',
    });
    expect(result[0].id).toBe('cop30');
  });
});
