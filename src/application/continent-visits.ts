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
  Qatar: 'Asia',
  Azerbaijan: 'Asia',
  'United Arab Emirates': 'Asia',
  Switzerland: 'Europe',
  France: 'Europe',
  Brazil: 'Americas',
};

const yearOf = (iso: string): number => Number.parseInt(iso.slice(0, 4), 10);

export const continentVisits = (stories: Story[]): ContinentCard[] => {
  const events = stories.filter((story) => {
    if (story.type !== 'global-stage') {
      return false;
    }
    const year = yearOf(story.date);
    return year >= 2023 && year <= 2026;
  });
  const grouped = new Map<ContinentId, Map<string, number>>();
  for (const event of events) {
    const continent = COUNTRY_CONTINENT[event.country];
    if (!continent) {
      continue;
    }
    const countries = grouped.get(continent) ?? new Map<string, number>();
    countries.set(event.country, (countries.get(event.country) ?? 0) + 1);
    grouped.set(continent, countries);
  }
  return CONTINENT_ORDER.filter((continent) => grouped.has(continent)).map((continent) => {
    const countries = [...(grouped.get(continent) ?? [])]
      .map(([country, visits]) => ({ country, visits }))
      .sort((left, right) => left.country.localeCompare(right.country));
    return {
      continent,
      connected: countries.length,
      visited: countries.reduce((sum, item) => sum + item.visits, 0),
      countries,
    };
  });
};

export const firstEventIndexByCountry = (tour: TourStop[], country: string): number =>
  tour.findIndex((stop) => stop.kind === 'event' && stop.country === country);

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
