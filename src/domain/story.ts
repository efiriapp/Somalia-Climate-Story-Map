export type ContentType = 'ice-story' | 'global-stage';

export type SdgNumber =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17;

export type GeoLocation = {
  name: string;
  lat: number;
  lng: number;
};

export type Story = {
  id: string;
  title: string;
  type: ContentType;
  date: string;
  themes: string[];
  sdgs: SdgNumber[];
  location: GeoLocation;
  summary: string;
  body: string;
  images: string[];
};

export type SortKey = 'newest' | 'oldest' | 'title' | 'keywords';

export type FilterCriteria = {
  query: string;
  type: ContentType | 'all';
  themes: string[];
  year: number | 'all';
  sdgs: SdgNumber[];
  sort: SortKey;
};

export const defaultFilterCriteria = (): FilterCriteria => ({
  query: '',
  type: 'ice-story',
  themes: [],
  year: 'all',
  sdgs: [],
  sort: 'newest',
});
