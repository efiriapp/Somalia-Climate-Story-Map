export type ContentType = 'ice-story' | 'global-stage' | 'research-story';

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
  region: string;
  district: string;
  location: GeoLocation;
  summary: string;
  body: string;
  images: string[];
  country: string;
  website: string;
  featuredPerson?: string;
  placeLabel?: string;
  videoTitle?: string;
  videoUrl?: string;
  stats?: { label: string; value: string }[];
  chapters?: { heading: string; paragraphs: string[] }[];
  tourStops?: { district: string; title: string; description: string; images: string[] }[];
};

export type SortKey = 'newest' | 'oldest' | 'title' | 'keywords';

export type FilterCriteria = {
  query: string;
  region: string;
  district: string;
  themes: string[];
  year: number | 'all';
  sdgs: SdgNumber[];
  sort: SortKey;
};

export const defaultFilterCriteria = (): FilterCriteria => ({
  query: '',
  region: 'all',
  district: 'all',
  themes: [],
  year: 'all',
  sdgs: [],
  sort: 'newest',
});
