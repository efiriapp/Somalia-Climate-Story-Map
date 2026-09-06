export type StorySo = {
  title?: string;
  summary?: string;
  body?: string;
  featuredPerson?: string;
  placeLabel?: string;
  mapTitle?: string;
  locationName?: string;
  country?: string;
  chapters?: { heading: string; paragraphs: string[] }[];
  tourStops?: { title: string; description: string }[];
  stats?: { label: string; value?: string }[];
  sourceCard?: {
    place?: string;
    city?: string;
    regionLabel?: string;
    country?: string;
    category?: string;
    impactAreas?: string[];
    featuredPerson?: string;
    primarySource?: string;
  };
};
