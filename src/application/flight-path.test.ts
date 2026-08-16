import { describe, expect, it } from 'vitest';
import {
  ARRIVE_T,
  CAMERA_MS,
  CITY_EASE_MS,
  CRUISE_ZOOM,
  FLIGHT_MS,
  FOLLOW_MAX_ZOOM,
  POPUP_DELAY_MS,
  TOUR_STEP_MS,
  arriveHeading,
  cruiseThenArrive,
  flightLeg,
  greatCircle,
  headingAlong,
  headingDegrees,
  pathCoordinates,
  pointAlong,
  slicePath,
  type LngLat,
} from './flight-path';
import { buildGlobalTour, MOGADISHU_HOME } from './global-tour';
import type { Story } from '../domain/story';

const mogadishu: LngLat = { lng: MOGADISHU_HOME.lng, lat: MOGADISHU_HOME.lat };
const doha: LngLat = { lng: 51.53, lat: 25.28 };

const story = (overrides: Partial<Story> & Pick<Story, 'id' | 'title' | 'date' | 'type'>): Story => ({
  themes: ['policy-diplomacy'],
  sdgs: [13],
  region: '',
  district: '',
  location: { name: 'Doha, Qatar', lat: 25.28, lng: 51.53 },
  summary: '',
  body: '',
  images: [],
  country: 'Qatar',
  website: 'https://ice.simad.edu.so/',
  ...overrides,
});

describe('greatCircle', () => {
  it('starts at Mogadishu and ends at the destination', () => {
    const path = greatCircle(mogadishu, doha, 32);
    expect(path[0]).toEqual(mogadishu);
    expect(path.at(-1)?.lat).toBeCloseTo(doha.lat, 5);
    expect(path.at(-1)?.lng).toBeCloseTo(doha.lng, 5);
  });

  it('includes intermediate points that stay on the short arc', () => {
    const path = greatCircle(mogadishu, doha, 8);
    expect(path.length).toBe(9);
    const mid = path[4];
    expect(mid.lat).toBeGreaterThan(mogadishu.lat);
    expect(mid.lat).toBeLessThan(doha.lat);
    expect(mid.lng).toBeGreaterThan(mogadishu.lng);
    expect(mid.lng).toBeLessThan(doha.lng);
  });
});

describe('pointAlong and slicePath', () => {
  it('returns the start at t=0 and the end at t=1', () => {
    const path = greatCircle(mogadishu, doha, 16);
    const start = pointAlong(path, 0);
    const end = pointAlong(path, 1);
    expect(start.lat).toBeCloseTo(mogadishu.lat, 5);
    expect(end.lat).toBeCloseTo(doha.lat, 5);
  });

  it('grows a racing line from origin toward the destination', () => {
    const path = greatCircle(mogadishu, doha, 16);
    const raced = slicePath(path, 0.5);
    expect(raced[0]).toEqual(path[0]);
    expect(raced.length).toBeGreaterThan(1);
    expect(raced.length).toBeLessThan(path.length);
    expect(raced.at(-1)?.lat).toBeCloseTo(pointAlong(path, 0.5).lat, 5);
  });
});

describe('headingDegrees', () => {
  it('points roughly north from Mogadishu toward Doha', () => {
    const heading = headingDegrees(mogadishu, doha);
    expect(heading).toBeGreaterThan(0);
    expect(heading).toBeLessThan(45);
  });
});

describe('pathCoordinates', () => {
  it('emits GeoJSON [lng, lat] pairs for MapLibre', () => {
    const coords = pathCoordinates(greatCircle(mogadishu, doha, 4));
    expect(coords[0]).toEqual([mogadishu.lng, mogadishu.lat]);
    expect(coords.at(-1)?.[0]).toBeCloseTo(doha.lng, 5);
  });
});

describe('headingAlong', () => {
  it('stays stable near the destination instead of flipping', () => {
    const path = greatCircle(mogadishu, doha, 32);
    const early = headingAlong(path, 0.1);
    const late = headingAlong(path, 0.99);
    expect(Math.abs(late - early)).toBeLessThan(40);
  });
});

describe('flight timing', () => {
  it('flies slowly so globe tiles can stay loaded and clear', () => {
    expect(FLIGHT_MS).toBeGreaterThanOrEqual(16000);
    expect(CAMERA_MS).toBeGreaterThanOrEqual(120);
    expect(CRUISE_ZOOM).toBeGreaterThanOrEqual(2.8);
    expect(CRUISE_ZOOM).toBeLessThan(5);
    expect(POPUP_DELAY_MS).toBe(1000);
    expect(TOUR_STEP_MS).toBe(FLIGHT_MS + CITY_EASE_MS + POPUP_DELAY_MS + 4000);
  });
});

describe('cruiseThenArrive', () => {
  it('holds cruise zoom for the whole flight, then lands at the stop zoom', () => {
    expect(cruiseThenArrive(0, 2.25, CRUISE_ZOOM, 11)).toBeCloseTo(2.25);
    expect(cruiseThenArrive(0.45, 2.25, CRUISE_ZOOM, 11)).toBeCloseTo(CRUISE_ZOOM);
    expect(cruiseThenArrive(0.99, 2.25, CRUISE_ZOOM, 11)).toBeCloseTo(CRUISE_ZOOM);
    expect(cruiseThenArrive(1, 2.25, CRUISE_ZOOM, 11)).toBe(11);
  });
});

describe('city-zoom airplane stability', () => {
  it('freezes heading after arrive so the plane does not rotate at city zoom', () => {
    const path = greatCircle(mogadishu, doha, 32);
    expect(arriveHeading(path, ARRIVE_T)).toBe(arriveHeading(path, 0.99));
    expect(arriveHeading(path, 0.99)).toBe(arriveHeading(path, 1));
  });

  it('locks the camera with one easeTo at city zoom so the plane does not shake', () => {
    expect(FOLLOW_MAX_ZOOM).toBeGreaterThan(CRUISE_ZOOM);
    expect(FOLLOW_MAX_ZOOM).toBeLessThan(11);
  });
});

describe('flightLeg', () => {
  it('flies from Mogadishu home to the event, then back home', () => {
    const tour = buildGlobalTour([
      story({ id: 'doha', title: 'LDC5 Doha', type: 'global-stage', date: '2023-03-20' }),
    ]);
    expect(flightLeg(tour, 0)).toBeNull();
    expect(flightLeg(tour, 1)).toEqual({
      from: { lng: MOGADISHU_HOME.lng, lat: MOGADISHU_HOME.lat },
      to: { lng: 51.53, lat: 25.28 },
    });
    expect(flightLeg(tour, 2)).toEqual({
      from: { lng: 51.53, lat: 25.28 },
      to: { lng: MOGADISHU_HOME.lng, lat: MOGADISHU_HOME.lat },
    });
  });
});
