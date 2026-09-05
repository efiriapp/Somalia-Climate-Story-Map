import type { Story } from '../domain/story';
import { regionCenter } from './region-coordinates';
import { SOMALIA_VIEW } from './resolve-map-view';

const REGION_LABELS: Record<string, string> = {
  mudug: 'Mudug',
  bay: 'Baay',
  hiraan: 'Hiiraan',
  'lower-juba': 'Lower Juba',
  banaadir: 'Banaadir',
};

const PLACE_LABELS: Record<string, string> = {
  ceelgula: 'Ceelgula',
  baydhaba: 'Baydhaba',
  xuduley: 'Xuduley',
  'far-libaax': 'Far-libaax',
  'lower-juba': 'Lower Juba',
  'liido-beach': 'Liido Beach',
  'mogadishu-primary-school': 'Mogadishu Primary and Secondary School',
  'boondheere-orphan-girls': 'Boondheere Orphan Girls Centre',
};

export const DISTRICT_ZOOM = 9;
export const BUILDING_ZOOM = 17;
export const DISTRICT_CLUSTER_SPAN = 0.25;
export const ORIGIN_HOLD_MS = 700;
export const DISTRICT_FLY_MS = 2800;
export const ACTIVE_DISTRICT_PIN = '#C62828';

export const districtLabelClass = (active: boolean): string =>
  active ? 'district-pin-label is-active' : 'district-pin-label';

export type RegionMapStop = {
  region: string;
  district: string;
  regionSlug: string;
  title: string;
  description: string;
  images: string[];
  lat: number;
  lng: number;
  flyLat: number;
  flyLng: number;
  zoom: number;
};

export const isDistrictCluster = (stops: { lat: number; lng: number }[]): boolean => {
  if (stops.length < 2) {
    return false;
  }
  const lats = stops.map((stop) => stop.lat);
  const lngs = stops.map((stop) => stop.lng);
  return (
    Math.max(...lats) - Math.min(...lats) < DISTRICT_CLUSTER_SPAN &&
    Math.max(...lngs) - Math.min(...lngs) < DISTRICT_CLUSTER_SPAN
  );
};

export type TourFlightStep = {
  lat: number;
  lng: number;
  zoom: number;
  durationMs: number;
  showPin: boolean;
  showSlider: boolean;
};

export const tourFlightPlan = (stop: {
  lat: number;
  lng: number;
  flyLat?: number;
  flyLng?: number;
  zoom?: number;
}): TourFlightStep[] => [
  {
    lat: SOMALIA_VIEW.center.lat,
    lng: SOMALIA_VIEW.center.lng,
    zoom: SOMALIA_VIEW.zoom,
    durationMs: ORIGIN_HOLD_MS,
    showPin: true,
    showSlider: false,
  },
  {
    lat: stop.flyLat ?? stop.lat,
    lng: stop.flyLng ?? stop.lng,
    zoom: stop.zoom ?? DISTRICT_ZOOM,
    durationMs: DISTRICT_FLY_MS,
    showPin: true,
    showSlider: true,
  },
];

export const buildRegionMapTour = (story: Story): RegionMapStop[] => {
  const pins = (story.tourStops ?? []).map((stop) => {
    const place = stop.place ?? stop.region;
    const center = regionCenter(place);
    return {
      region: REGION_LABELS[stop.region] ?? stop.region,
      district: PLACE_LABELS[place] ?? place,
      regionSlug: stop.region,
      title: stop.title,
      description: stop.description,
      images: stop.images,
      lat: center.lat,
      lng: center.lng,
    };
  });
  const buildingTour =
    isDistrictCluster(pins) || pins.every((stop) => stop.regionSlug === 'banaadir');
  return pins.map((stop) => ({
    ...stop,
    flyLat: stop.lat,
    flyLng: stop.lng,
    zoom: buildingTour ? BUILDING_ZOOM : DISTRICT_ZOOM,
  }));
};
