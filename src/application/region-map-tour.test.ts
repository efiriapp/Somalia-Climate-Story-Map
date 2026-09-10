import { describe, expect, it } from 'vitest';
import { stories } from '../content/stories';
import { SOMALIA_VIEW } from './resolve-map-view';
import { regionCenter } from './region-coordinates';
import {
  ACTIVE_DISTRICT_PIN,
  BUILDING_ZOOM,
  DISTRICT_ZOOM,
  buildRegionMapTour,
  districtLabelClass,
  tourFlightPlan,
} from './region-map-tour';

describe('buildRegionMapTour', () => {
  it('tours SIMAD drought places from campus to Lower Juba', () => {
    const story = stories.find((item) => item.id === 'simad-drought');
    const tour = buildRegionMapTour(story!);

    expect(tour.map((stop) => stop.district)).toEqual([
      'SIMAD University',
      'Ceelgula',
      'Baydhaba',
      'Xuduley',
      'Far-libaax',
      'Lower Juba',
    ]);
    expect(tour[0]).toMatchObject({
      ...regionCenter('wadajir'),
      flyLat: regionCenter('wadajir').lat,
      flyLng: regionCenter('wadajir').lng,
      zoom: DISTRICT_ZOOM,
      district: 'SIMAD University',
      images: [
        '/images/ice-stories/simad-drought-statement-1.jpg',
        '/images/ice-stories/simad-drought-statement-2.jpg',
      ],
    });
    expect(tour[1]).toMatchObject({
      ...regionCenter('ceelgula'),
      flyLat: regionCenter('ceelgula').lat,
      flyLng: regionCenter('ceelgula').lng,
      zoom: DISTRICT_ZOOM,
      district: 'Ceelgula',
      images: ['/images/ice-stories/mudug.jpg', '/images/ice-stories/mudug-2.jpg'],
    });
    expect(tour[2]).toMatchObject({
      ...regionCenter('baydhaba'),
      district: 'Baydhaba',
      images: [
        '/images/ice-stories/baay.jpg',
        '/images/ice-stories/baay-food-1.jpg',
        '/images/ice-stories/baay-food-2.jpg',
      ],
    });
    expect(tour[3]).toMatchObject({
      ...regionCenter('xuduley'),
      district: 'Xuduley',
      images: ['/images/ice-stories/hiiraan.jpg', '/images/ice-stories/hiiraan-2.jpg'],
    });
    expect(tour[4]).toMatchObject({
      ...regionCenter('far-libaax'),
      district: 'Far-libaax',
      images: ['/images/ice-stories/hiiraan-3.jpg', '/images/ice-stories/hiiraan-4.jpg'],
    });
    expect(tour.at(-1)).toMatchObject({
      ...regionCenter('lower-juba'),
      district: 'Lower Juba',
      images: [
        '/images/ice-stories/lower-juba.jpg',
        '/images/ice-stories/lower-juba-2.jpg',
        '/images/ice-stories/lower-juba-3.jpg',
      ],
    });
    for (const stop of tour) {
      const sentences = stop.description.split(/(?<=[.!?])\s+/).filter(Boolean);
      expect(sentences.length).toBeGreaterThanOrEqual(5);
      expect(sentences.length).toBeLessThanOrEqual(7);
      expect(stop.description).not.toMatch(/SoDMA|SODMA|FAO|SWALIM/i);
    }
    const storyText = [story?.summary, story?.body, ...(story?.chapters ?? []).flatMap((chapter) => chapter.paragraphs)].join(' ');
    expect(storyText).not.toMatch(/SoDMA|SODMA|FAO|SWALIM|XAJSi/i);
  });

  it('tours Green Champions from Liido Beach to the two school outreaches', () => {
    const story = stories.find((item) => item.id === 'green-champions');
    const tour = buildRegionMapTour(story!);

    expect(tour.map((stop) => stop.district)).toEqual([
      'Liido Beach',
      'Mogadishu Primary and Secondary School',
      'Boondheere Orphan Girls Centre',
    ]);
    expect(tour[0]).toMatchObject({ ...regionCenter('liido-beach'), zoom: BUILDING_ZOOM });
    expect(tour[1]).toMatchObject({ ...regionCenter('mogadishu-primary-school'), zoom: BUILDING_ZOOM });
    expect(tour[2]).toMatchObject({ ...regionCenter('boondheere-orphan-girls'), zoom: BUILDING_ZOOM });
    for (const stop of tour) {
      expect(stop.flyLat).toBe(stop.lat);
      expect(stop.flyLng).toBe(stop.lng);
      expect(stop.zoom).toBe(BUILDING_ZOOM);
    }
  });
});

describe('tourFlightPlan', () => {
  it('starts at Somalia country zoom, then flies to the helped district', () => {
    const next = regionCenter('xuduley');
    expect(tourFlightPlan({ ...next, flyLat: next.lat, flyLng: next.lng })).toEqual([
      {
        lat: SOMALIA_VIEW.center.lat,
        lng: SOMALIA_VIEW.center.lng,
        zoom: SOMALIA_VIEW.zoom,
        durationMs: 700,
        showPin: true,
        showSlider: false,
      },
      {
        lat: next.lat,
        lng: next.lng,
        zoom: DISTRICT_ZOOM,
        durationMs: 2800,
        showPin: true,
        showSlider: true,
      },
    ]);
    expect(DISTRICT_ZOOM).toBe(9);
    expect(BUILDING_ZOOM).toBe(17);
    expect(SOMALIA_VIEW.zoom).toBe(6);
  });

  it('flies close city stops to building zoom', () => {
    const next = regionCenter('liido-beach');
    expect(tourFlightPlan({ ...next, flyLat: next.lat, flyLng: next.lng, zoom: BUILDING_ZOOM })[1]).toMatchObject({
      lat: next.lat,
      lng: next.lng,
      zoom: BUILDING_ZOOM,
    });
  });
});

describe('districtLabelClass', () => {
  it('keeps the district name label forest green until that place is touring', () => {
    expect(ACTIVE_DISTRICT_PIN).toBe('#C62828');
    expect(districtLabelClass(false)).toBe('district-pin-label');
    expect(districtLabelClass(true)).toBe('district-pin-label is-active');
  });
});
