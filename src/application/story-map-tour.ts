import { DISTRICTS } from '../domain/somalia';
import type { Story } from '../domain/story';
import { districtCenter } from './district-coordinates';

export type StoryMapStop = {
  district: string;
  districtSlug: string;
  title: string;
  description: string;
  images: string[];
  lat: number;
  lng: number;
};

export const buildStoryMapTour = (story: Story): StoryMapStop[] =>
  (story.tourStops ?? []).map((stop) => {
    const district = DISTRICTS.find((item) => item.slug === stop.district);
    const center = districtCenter(stop.district);
    return {
      district: district?.label ?? stop.district,
      districtSlug: stop.district,
      title: stop.title,
      description: stop.description,
      images: stop.images,
      lat: center.lat,
      lng: center.lng,
    };
  });
