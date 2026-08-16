import { describe, expect, it } from 'vitest';
import { filterCatalog } from './filter-catalog';
import { defaultFilterCriteria, type Story } from '../domain/story';

const story = (overrides: Partial<Story> & Pick<Story, 'id' | 'title'>): Story => ({
  type: 'ice-story',
  date: '2024-01-01',
  themes: ['youth'],
  sdgs: [13],
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
    summary: 'Young Somalis reclaim the coast.',
  }),
  story({
    id: 'cop30',
    title: 'ICE Institute at COP30',
    type: 'global-stage',
    themes: ['policy-diplomacy'],
    sdgs: [13],
    date: '2026-01-01',
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
  it('defaults to ICE stories only', () => {
    const result = filterCatalog(catalog, defaultFilterCriteria());
    expect(result.map((item) => item.id)).toEqual(['beach', 'ecosom']);
  });

  it('filters by keyword across title, summary, and body', () => {
    const result = filterCatalog(catalog, {
      ...defaultFilterCriteria(),
      type: 'all',
      query: 'belém',
    });
    expect(result.map((item) => item.id)).toEqual(['cop30']);
  });

  it('matches a story if any selected theme is present', () => {
    const result = filterCatalog(catalog, {
      ...defaultFilterCriteria(),
      type: 'all',
      themes: ['oceans', 'policy-diplomacy'],
    });
    expect(result.map((item) => item.id)).toEqual(['cop30', 'beach']);
  });

  it('matches a story if any selected SDG is present', () => {
    const result = filterCatalog(catalog, {
      ...defaultFilterCriteria(),
      type: 'all',
      sdgs: [7],
    });
    expect(result.map((item) => item.id)).toEqual(['ecosom']);
  });

  it('filters by calendar year', () => {
    const result = filterCatalog(catalog, {
      ...defaultFilterCriteria(),
      type: 'all',
      year: 2026,
    });
    expect(result.map((item) => item.id)).toEqual(['cop30']);
  });

  it('sorts newest first by default', () => {
    const result = filterCatalog(catalog, {
      ...defaultFilterCriteria(),
      type: 'all',
    });
    expect(result.map((item) => item.id)).toEqual(['cop30', 'beach', 'ecosom']);
  });

  it('sorts by most keyword hits when requested', () => {
    const result = filterCatalog(catalog, {
      ...defaultFilterCriteria(),
      type: 'all',
      query: 'climate',
      sort: 'keywords',
    });
    expect(result[0].id).toBe('cop30');
  });
});
