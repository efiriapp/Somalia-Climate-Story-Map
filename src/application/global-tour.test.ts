import { describe, expect, it } from 'vitest';
import { buildGlobalTour, CITY_ZOOM, GLOBE_VIEW, formatTourDate, nextTourIndex, prevTourIndex, tourDateParts, tourPopupHtml } from './global-tour';
import type { Story } from '../domain/story';

const story = (overrides: Partial<Story> & Pick<Story, 'id' | 'title' | 'date' | 'type'>): Story => ({
  themes: ['policy-diplomacy'],
  sdgs: [13],
  region: '',
  district: '',
  location: { name: 'Doha, Qatar', lat: 25.28, lng: 51.53 },
  summary: '',
  body: '',
  images: [],
  country: 'Somalia',
  website: 'https://ice.simad.edu.so/',
  ...overrides,
});

const catalog: Story[] = [
  story({
    id: 'local',
    title: 'Local garden',
    type: 'ice-story',
    date: '2024-01-01',
    region: 'banaadir',
    district: 'wadajir',
    location: { name: 'Mogadishu', lat: 2.05, lng: 45.32 },
  }),
  story({
    id: 'old',
    title: 'Too old',
    type: 'global-stage',
    date: '2022-12-01',
  }),
  story({
    id: 'doha',
    title: 'LDC5 Doha',
    type: 'global-stage',
    date: '2023-03-20',
    country: 'Qatar',
    website: 'https://ice.simad.edu.so/',
    images: ['/images/global-stage/ldc5-doha.png'],
  }),
  story({
    id: 'cop30',
    title: 'COP30',
    type: 'global-stage',
    date: '2026-01-01',
    location: { name: 'Belém, Brazil', lat: -1.45, lng: -48.49 },
  }),
];

describe('buildGlobalTour', () => {
  it('orders events from the earliest date', () => {
    const events = buildGlobalTour(catalog).filter((stop) => stop.kind === 'event');
    expect(events.map((stop) => stop.date)).toEqual(['2023-03-20', '2026-01-01']);
    expect(events.map((stop) => stop.storyId)).toEqual(['doha', 'cop30']);
  });

  it('puts title, country, website, and images on each event stop', () => {
    const event = buildGlobalTour(catalog).find((stop) => stop.storyId === 'doha');
    expect(event).toMatchObject({
      title: 'LDC5 Doha',
      country: 'Qatar',
      website: 'https://ice.simad.edu.so/',
      images: ['/images/global-stage/ldc5-doha.png'],
    });
  });

  it('starts in Mogadishu, returns to Mogadishu after every event, and ends there', () => {
    const tour = buildGlobalTour(catalog);
    expect(tour[0]?.kind).toBe('home');
    expect(tour[0]?.title).toBe('Mogadishu, Somalia');
    expect(tour.at(-1)?.kind).toBe('home');
    for (let i = 0; i < tour.length; i += 1) {
      if (tour[i].kind === 'event') {
        expect(tour[i - 1]?.kind).toBe('home');
        expect(tour[i + 1]?.kind).toBe('home');
      }
    }
  });

  it('fills the map with a Somalia-centered globe and zooms to city level at event stops', () => {
    expect(GLOBE_VIEW.lng).toBeCloseTo(45.32, 1);
    expect(GLOBE_VIEW.lat).toBeGreaterThan(0);
    expect(GLOBE_VIEW.lat).toBeLessThan(12);
    expect(GLOBE_VIEW.zoom).toBeGreaterThanOrEqual(2.5);
    expect(GLOBE_VIEW.pitch).toBeLessThanOrEqual(12);
    expect(GLOBE_VIEW.maxZoom).toBeGreaterThanOrEqual(11);
    const tour = buildGlobalTour(catalog);
    for (const stop of tour) {
      if (stop.kind === 'home') {
        expect(stop.zoom).toBe(GLOBE_VIEW.zoom);
      } else {
        expect(stop.zoom).toBe(CITY_ZOOM);
        expect(stop.zoom).toBeGreaterThanOrEqual(10);
      }
    }
  });
});

describe('tour popup', () => {
  it('does not build a popup for Somalia home stops', () => {
    const home = buildGlobalTour(catalog).find((stop) => stop.kind === 'home');
    expect(home).toBeDefined();
    expect(tourPopupHtml(home!)).toBeNull();
  });

  it('splits actual document dates into rolling year, month, and day parts', () => {
    expect(tourDateParts('2023-07-01')).toMatchObject({
      year: '2023',
      month: 'JUL',
      day: '01',
    });
    expect(tourDateParts('2023-03-03')).toMatchObject({
      year: '2023',
      month: 'MAR',
      day: '03',
      weekday: 'FRI',
    });
  });

  it('builds a centered popup with title, date, country, and source link', () => {
    const event = buildGlobalTour(catalog).find((stop) => stop.storyId === 'doha');
    const html = tourPopupHtml(event!);
    expect(html).toContain('Title:');
    expect(html).toContain('Date:');
    expect(html).toContain(formatTourDate('2023-03-20'));
    expect(html).toContain('Country:');
    expect(html).toContain('Qatar');
    expect(html).toContain('More information:');
    expect(html).toContain('ldc5-doha.png');
  });
});

describe('tour index', () => {
  it('steps forward and back without leaving the tour', () => {
    expect(nextTourIndex(0, 5)).toBe(1);
    expect(nextTourIndex(4, 5)).toBe(4);
    expect(prevTourIndex(0)).toBe(0);
    expect(prevTourIndex(2)).toBe(1);
  });
});
