import type { Story } from '../domain/story';
import { regionCenter } from './region-coordinates';

const REGION_LABELS: Record<string, string> = {
  mudug: 'Mudug',
  bay: 'Baay',
  hiraan: 'Hiiraan',
  'lower-juba': 'Lower Juba',
};

export type RegionMapStop = {
  region: string;
  regionSlug: string;
  title: string;
  description: string;
  images: string[];
  lat: number;
  lng: number;
};

export const buildRegionMapTour = (story: Story): RegionMapStop[] =>
  (story.tourStops ?? []).map((stop) => {
    const center = regionCenter(stop.region);
    return {
      region: REGION_LABELS[stop.region] ?? stop.region,
      regionSlug: stop.region,
      title: stop.title,
      description: stop.description,
      images: stop.images,
      lat: center.lat,
      lng: center.lng,
    };
  });
