import type { Story } from '../domain/story';
import type { TourStop } from './global-tour';

export type ContinentId = 'Africa' | 'Asia' | 'Europe' | 'Americas';

export type CountryVisit = {
  country: string;
  visits: number;
};

export type ContinentCard = {
  continent: ContinentId;
  connected: number;
  visited: number;
  countries: CountryVisit[];
};

const CONTINENT_ORDER: ContinentId[] = ['Africa', 'Asia', 'Europe', 'Americas'];

const COUNTRY_CONTINENT: Record<string, ContinentId> = {
  Somalia: 'Africa',
  Egypt: 'Africa',
  Rwanda: 'Africa',
  Kenya: 'Africa',
  Zambia: 'Africa',
  Ethiopia: 'Africa',
  Ghana: 'Africa',
  Djibouti: 'Africa',
  Qatar: 'Asia',
  Azerbaijan: 'Asia',
  'United Arab Emirates': 'Asia',
  Switzerland: 'Europe',
  France: 'Europe',
  Brazil: 'Americas',
};

const yearOf = (iso: string): number => Number.parseInt(iso.slice(0, 4), 10);

export type TourFilter = {
  year: number | 'all';
  continent: ContinentId | 'all';
  country: string | 'all';
};

export const defaultTourFilter = (): TourFilter => ({
  year: 'all',
  continent: 'all',
  country: 'all',
});

const globalEvents = (stories: Story[]): Story[] =>
  stories.filter((story) => {
    if (story.type !== 'global-stage') {
      return false;
    }
    const year = yearOf(story.date);
    return year >= 2023 && year <= 2026;
  });

export const continentOfCountry = (country: string): ContinentId | undefined => COUNTRY_CONTINENT[country];

export const filterYears = (stories: Story[]): number[] =>
  [...new Set(globalEvents(stories).map((story) => yearOf(story.date)))].sort((left, right) => left - right);

export const filterContinents = (stories: Story[], year: number | 'all'): ContinentId[] => {
  const present = new Set(
    globalEvents(stories)
      .filter((story) => year === 'all' || yearOf(story.date) === year)
      .map((story) => COUNTRY_CONTINENT[story.country])
      .filter((continent): continent is ContinentId => Boolean(continent)),
  );
  return CONTINENT_ORDER.filter((continent) => present.has(continent));
};

export const filterCountries = (
  stories: Story[],
  year: number | 'all',
  continent: ContinentId | 'all',
): string[] => {
  const names = globalEvents(stories)
    .filter((story) => {
      if (year !== 'all' && yearOf(story.date) !== year) {
        return false;
      }
      const storyContinent = COUNTRY_CONTINENT[story.country];
      if (!storyContinent) {
        return false;
      }
      return continent === 'all' || storyContinent === continent;
    })
    .map((story) => story.country);
  return [...new Set(names)].sort((left, right) => left.localeCompare(right));
};

export const constrainTourFilter = (stories: Story[], filter: TourFilter): TourFilter => {
  const years = filterYears(stories);
  const year = filter.year === 'all' || years.includes(filter.year) ? filter.year : 'all';
  const continents = filterContinents(stories, year);
  const continent =
    filter.continent === 'all' || continents.includes(filter.continent) ? filter.continent : 'all';
  const countries = filterCountries(stories, year, continent);
  const country = filter.country === 'all' || countries.includes(filter.country) ? filter.country : 'all';
  return { year, continent, country };
};

export const matchesTourFilter = (story: { date: string; country: string }, filter: TourFilter): boolean => {
  if (filter.year !== 'all' && yearOf(story.date) !== filter.year) {
    return false;
  }
  const continent = COUNTRY_CONTINENT[story.country];
  if (filter.continent !== 'all' && continent !== filter.continent) {
    return false;
  }
  return filter.country === 'all' || story.country === filter.country;
};

export type ContinentSummary = {
  continent: ContinentId;
  count: number;
};

export const continentSummaries = (stories: Story[], filter: TourFilter): ContinentSummary[] => {
  const counts = new Map<ContinentId, number>();
  for (const story of globalEvents(stories)) {
    if (!matchesTourFilter(story, filter)) {
      continue;
    }
    const continent = COUNTRY_CONTINENT[story.country];
    if (!continent) {
      continue;
    }
    counts.set(continent, (counts.get(continent) ?? 0) + 1);
  }
  return CONTINENT_ORDER.filter((continent) => (counts.get(continent) ?? 0) > 0).map((continent) => ({
    continent,
    count: counts.get(continent) ?? 0,
  }));
};

export const tallyContinentVisits = (countries: string[]): ContinentCard[] => {
  const grouped = new Map<ContinentId, Map<string, number>>();
  for (const continent of CONTINENT_ORDER) {
    grouped.set(continent, new Map());
  }
  for (const country of countries) {
    const continent = COUNTRY_CONTINENT[country];
    if (!continent) {
      continue;
    }
    const counts = grouped.get(continent) ?? new Map<string, number>();
    counts.set(country, (counts.get(country) ?? 0) + 1);
    grouped.set(continent, counts);
  }
  return CONTINENT_ORDER.map((continent) => {
    const counts = grouped.get(continent) ?? new Map<string, number>();
    const items = [...counts]
      .map(([country, visits]) => ({ country, visits }))
      .sort((left, right) => left.country.localeCompare(right.country));
    return {
      continent,
      connected: items.length,
      visited: items.reduce((sum, item) => sum + item.visits, 0),
      countries: items,
    };
  });
};

export const continentVisits = (stories: Story[]): ContinentCard[] => {
  const events = stories.filter((story) => {
    if (story.type !== 'global-stage') {
      return false;
    }
    const year = yearOf(story.date);
    return year >= 2023 && year <= 2026;
  });
  return tallyContinentVisits(events.map((story) => story.country)).filter((row) => row.visited > 0);
};

export const firstEventIndexByCountry = (tour: TourStop[], country: string, year: number | 'all' = 'all'): number =>
  tour.findIndex(
    (stop) =>
      stop.kind === 'event' &&
      stop.country === country &&
      (year === 'all' || yearOf(stop.date) === year),
  );

export const firstEventIndexByContinent = (
  tour: TourStop[],
  continent: ContinentId,
  year: number | 'all' = 'all',
): number =>
  tour.findIndex(
    (stop) =>
      stop.kind === 'event' &&
      continentOfCountry(stop.country) === continent &&
      (year === 'all' || yearOf(stop.date) === year),
  );

export const searchTourStops = (tour: TourStop[], query: string): TourStop[] => {
  const needle = query.trim().toLowerCase();
  return tour.filter((stop) => {
    if (stop.kind !== 'event') {
      return false;
    }
    if (!needle) {
      return true;
    }
    return [stop.title, stop.country, stop.place].some((value) => value.toLowerCase().includes(needle));
  });
};
