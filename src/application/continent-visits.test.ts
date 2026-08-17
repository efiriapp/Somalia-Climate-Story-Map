import { describe, expect, it } from 'vitest';
import { stories } from '../content/stories';
import {
  continentVisits,
  firstEventIndexByCountry,
  searchTourStops,
  tallyContinentVisits,
} from './continent-visits';
import { buildGlobalTour } from './global-tour';

describe('tallyContinentVisits', () => {
  it('starts every continent at zero countries and zero frequency', () => {
    expect(tallyContinentVisits([])).toEqual([
      { continent: 'Africa', connected: 0, visited: 0, countries: [] },
      { continent: 'Asia', connected: 0, visited: 0, countries: [] },
      { continent: 'Europe', connected: 0, visited: 0, countries: [] },
      { continent: 'Americas', connected: 0, visited: 0, countries: [] },
    ]);
  });

  it('updates countries and frequency as the map visits events', () => {
    const rows = tallyContinentVisits(['Egypt', 'Qatar', 'Qatar', 'France']);
    expect(rows.find((row) => row.continent === 'Africa')).toMatchObject({
      connected: 1,
      visited: 1,
      countries: [{ country: 'Egypt', visits: 1 }],
    });
    expect(rows.find((row) => row.continent === 'Asia')).toMatchObject({
      connected: 1,
      visited: 2,
      countries: [{ country: 'Qatar', visits: 2 }],
    });
    expect(rows.find((row) => row.continent === 'Europe')).toMatchObject({
      connected: 1,
      visited: 1,
      countries: [{ country: 'France', visits: 1 }],
    });
    expect(rows.find((row) => row.continent === 'Americas')).toMatchObject({
      connected: 0,
      visited: 0,
      countries: [],
    });
  });
});

describe('continentVisits', () => {
  it('groups ICE global-stage countries by continent from catalog documents', () => {
    const cards = continentVisits(stories);
    expect(cards.map((card) => card.continent)).toEqual(['Africa', 'Asia', 'Europe', 'Americas']);

    const africa = cards.find((card) => card.continent === 'Africa');
    expect(africa?.connected).toBe(7);
    expect(africa?.visited).toBe(10);
    expect(africa?.countries.map((item) => item.country)).toEqual([
      'Djibouti',
      'Egypt',
      'Ethiopia',
      'Ghana',
      'Kenya',
      'Rwanda',
      'Zambia',
    ]);

    const asia = cards.find((card) => card.continent === 'Asia');
    expect(asia?.connected).toBe(3);
    expect(asia?.visited).toBe(5);
    expect(asia?.countries.map((item) => item.country)).toEqual([
      'Azerbaijan',
      'Qatar',
      'United Arab Emirates',
    ]);

    const europe = cards.find((card) => card.continent === 'Europe');
    expect(europe).toMatchObject({ connected: 2, visited: 2 });
    expect(europe?.countries.map((item) => item.country)).toEqual(['France', 'Switzerland']);

    const americas = cards.find((card) => card.continent === 'Americas');
    expect(americas).toMatchObject({ connected: 1, visited: 1 });
    expect(americas?.countries.map((item) => item.country)).toEqual(['Brazil']);
  });
});

describe('tour country search', () => {
  it('finds the first event stop for a visited country', () => {
    const tour = buildGlobalTour(stories);
    const kenya = firstEventIndexByCountry(tour, 'Kenya');
    expect(tour[kenya]?.country).toBe('Kenya');
    expect(tour[kenya]?.kind).toBe('event');
    expect(kenya).toBeGreaterThan(0);
  });

  it('filters event stops by country, city, or title', () => {
    const tour = buildGlobalTour(stories);
    const matches = searchTourStops(tour, 'doha');
    expect(matches.every((stop) => stop.kind === 'event')).toBe(true);
    expect(matches.some((stop) => stop.country === 'Qatar')).toBe(true);
  });
});
