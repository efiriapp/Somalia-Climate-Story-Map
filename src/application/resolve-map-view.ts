import type { FilterCriteria, Story } from '../domain/story';

export type MapView = {
  center: { lat: number; lng: number };
  zoom: number;
};

/** South-west and north-east corners: the opening view of every Somalia map. */
export type LatLngBoundsTuple = [[number, number], [number, number]];
export const SOMALIA_BOUNDS: LatLngBoundsTuple = [
  [-1.8, 40.9],
  [12.1, 51.5],
];

/** The same view as a centre and zoom, for maps that fly between places. */
export const SOMALIA_VIEW: MapView = {
  center: { lat: 5.15, lng: 46.2 },
  zoom: 6,
};

/** Smallest box around the points, or null when there are none. */
export const boundsOf = (points: { lat: number; lng: number }[]): LatLngBoundsTuple | null => {
  if (!points.length) return null;
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ];
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
