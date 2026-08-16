import type { FilterCriteria, Story } from '../domain/story';

export type MapView = {
  center: { lat: number; lng: number };
  zoom: number;
};

export const SOMALIA_VIEW: MapView = {
  center: { lat: 5.15, lng: 46.2 },
  zoom: 6,
};

export const WORLD_VIEW: MapView = {
  center: { lat: 15, lng: 20 },
  zoom: 2,
};

export const resolveMapView = (_criteria: FilterCriteria, matches: Story[]): MapView => {
  if (matches.length > 0 && matches.every((story) => story.region === '')) {
    return WORLD_VIEW;
  }
  return SOMALIA_VIEW;
};
