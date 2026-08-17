import { describe, expect, it } from 'vitest';
import { stories } from '../content/stories';
import {
  continentVisits,
  constrainTourFilter,
  defaultTourFilter,
  filterContinents,
  filterCountries,
  filterYears,
  firstEventIndexByCountry,
  firstEventIndexByContinent,
  firstEventIndexMatching,
  continentSummaries,
  summaryTotal,
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

describe('connected tour filters', () => {
  it('lists years, then continents and countries that exist in the selected year', () => {
    expect(filterYears(stories)).toEqual([2023, 2024, 2025, 2026]);
    expect(filterContinents(stories, 2023)).toEqual(['Africa', 'Asia']);
    expect(filterCountries(stories, 2023, 'Asia')).toEqual(['Qatar', 'United Arab Emirates']);
  });

  it('clears child dropdowns when a parent filter no longer matches', () => {
    const next = constrainTourFilter(stories, {
      year: 2023,
      continent: 'Americas',
      country: 'Brazil',
    });
    expect(next).toEqual({ year: 2023, continent: 'all', country: 'all' });
  });
});

describe('continent summaries', () => {
  it('shows catalog event counts by continent without visit tracking', () => {
    expect(continentSummaries(stories, defaultTourFilter())).toEqual([
      { continent: 'Africa', count: 10 },
      { continent: 'Asia', count: 5 },
      { continent: 'Europe', count: 2 },
      { continent: 'Americas', count: 1 },
    ]);
  });

  it('keeps only continents that match the selected year', () => {
    expect(
      continentSummaries(stories, { year: 2023, continent: 'all', country: 'all' }).map(
        (card) => card.continent,
      ),
    ).toEqual(['Africa', 'Asia']);
  });

  it('narrows a continent total when a country filter is selected', () => {
    expect(
      continentSummaries(stories, { year: 2023, continent: 'all', country: 'Qatar' }),
    ).toEqual([{ continent: 'Asia', count: 2 }]);
  });

  it('adds a dashboard total that follows the default catalog and the active filter', () => {
    expect(summaryTotal(stories, defaultTourFilter())).toBe(18);
    expect(summaryTotal(stories, { year: 2023, continent: 'all', country: 'all' })).toBe(
      continentSummaries(stories, { year: 2023, continent: 'all', country: 'all' }).reduce(
        (sum, card) => sum + card.count,
        0,
      ),
    );
    expect(summaryTotal(stories, { year: 2023, continent: 'all', country: 'Qatar' })).toBe(2);
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

  it('finds the first event stop for a continent so cards can fly the map', () => {
    const tour = buildGlobalTour(stories);
    const africa = firstEventIndexByContinent(tour, 'Africa');
    expect(tour[africa]?.kind).toBe('event');
    expect(tour[africa]?.country).toBeDefined();
  });

  it('finds the first tour event that matches year, continent, and country filters', () => {
    const tour = buildGlobalTour(stories);
    const asia = firstEventIndexMatching(tour, { year: 2023, continent: 'Asia', country: 'all' });
    expect(tour[asia]?.kind).toBe('event');
    expect(['Qatar', 'United Arab Emirates']).toContain(tour[asia]?.country);
  });

  it('filters event stops by country, city, or title', () => {
    const tour = buildGlobalTour(stories);
    const matches = searchTourStops(tour, 'doha');
    expect(matches.every((stop) => stop.kind === 'event')).toBe(true);
    expect(matches.some((stop) => stop.country === 'Qatar')).toBe(true);
  });
});
