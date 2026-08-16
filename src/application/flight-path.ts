import type { TourStop } from './global-tour';

export type LngLat = { lng: number; lat: number };

export const FLIGHT_MS = 7000;
export const POPUP_DELAY_MS = 3000;
export const TOUR_STEP_MS = FLIGHT_MS + POPUP_DELAY_MS + 4000;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;
const toDegrees = (radians: number): number => (radians * 180) / Math.PI;

export const greatCircle = (from: LngLat, to: LngLat, steps = 64): LngLat[] => {
  const count = Math.max(steps, 2);
  const φ1 = toRadians(from.lat);
  const λ1 = toRadians(from.lng);
  const φ2 = toRadians(to.lat);
  const λ2 = toRadians(to.lng);
  const delta = 2 * Math.asin(
    Math.sqrt(
      Math.sin((φ2 - φ1) / 2) ** 2 +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2,
    ),
  );
  if (delta < 1e-10) {
    return [from, to];
  }
  const path: LngLat[] = [];
  for (let i = 0; i <= count; i += 1) {
    const fraction = i / count;
    const a = Math.sin((1 - fraction) * delta) / Math.sin(delta);
    const b = Math.sin(fraction * delta) / Math.sin(delta);
    const x = a * Math.cos(φ1) * Math.cos(λ1) + b * Math.cos(φ2) * Math.cos(λ2);
    const y = a * Math.cos(φ1) * Math.sin(λ1) + b * Math.cos(φ2) * Math.sin(λ2);
    const z = a * Math.sin(φ1) + b * Math.sin(φ2);
    path.push({
      lat: toDegrees(Math.atan2(z, Math.sqrt(x * x + y * y))),
      lng: toDegrees(Math.atan2(y, x)),
    });
  }
  return path;
};

export const pointAlong = (path: LngLat[], t: number): LngLat => {
  if (path.length === 0) {
    throw new Error('path is empty');
  }
  const clamped = Math.min(1, Math.max(0, t));
  if (path.length === 1) {
    return path[0];
  }
  const position = clamped * (path.length - 1);
  const index = Math.min(Math.floor(position), path.length - 2);
  const fraction = position - index;
  const from = path[index];
  const to = path[index + 1];
  return {
    lng: from.lng + (to.lng - from.lng) * fraction,
    lat: from.lat + (to.lat - from.lat) * fraction,
  };
};

export const slicePath = (path: LngLat[], t: number): LngLat[] => {
  if (path.length === 0) {
    return [];
  }
  const clamped = Math.min(1, Math.max(0, t));
  if (clamped === 0) {
    return [path[0]];
  }
  const position = clamped * (path.length - 1);
  const index = Math.floor(position);
  return [...path.slice(0, index + 1), pointAlong(path, clamped)];
};

export const headingDegrees = (from: LngLat, to: LngLat): number => {
  const φ1 = toRadians(from.lat);
  const φ2 = toRadians(to.lat);
  const Δλ = toRadians(to.lng - from.lng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDegrees(Math.atan2(y, x)) + 360) % 360;
};

export const headingAlong = (path: LngLat[], t: number): number => {
  const fromT = Math.max(0, Math.min(0.9, t) - 0.05);
  const toT = Math.min(1, Math.max(t, 0.1) + 0.05);
  return headingDegrees(pointAlong(path, fromT), pointAlong(path, toT));
};

export const pathCoordinates = (path: LngLat[]): [number, number][] =>
  path.map((point) => [point.lng, point.lat]);

export const flightLeg = (
  tour: TourStop[],
  index: number,
): { from: LngLat; to: LngLat } | null => {
  const from = tour[index - 1];
  const to = tour[index];
  if (!from || !to) {
    return null;
  }
  if (from.lat === to.lat && from.lng === to.lng) {
    return null;
  }
  return {
    from: { lng: from.lng, lat: from.lat },
    to: { lng: to.lng, lat: to.lat },
  };
};
