import { describe, expect, it } from 'vitest';
import { SOMALIA_BOUNDS, SOMALIA_VIEW, boundsOf, resolveMapView } from './resolve-map-view';
import { defaultFilterCriteria, type Story } from '../domain/story';

const pin = (id: string, region: string): Story => ({
  id,
  title: id,
  type: 'ice-story',
  date: '2024-01-01',
  themes: [],
  sdgs: [13],
  region,
  district: region ? 'wadajir' : '',
  location: { name: 'Mogadishu', lat: 2.05, lng: 45.32 },
  summary: '',
  body: '',
  images: [],
  country: 'Somalia',
  website: 'https://ice.simad.edu.so/',
});

describe('resolveMapView', () => {
  it('frames Somalia when stories have a Somali region', () => {
    expect(resolveMapView(defaultFilterCriteria(), [pin('a', 'banaadir')])).toEqual({
      center: { lat: 5.15, lng: 46.2 },
      zoom: 6,
    });
  });

  it('frames the world when no matched story has a Somali region', () => {
    expect(resolveMapView(defaultFilterCriteria(), [pin('a', '')])).toEqual({
      center: { lat: 15, lng: 20 },
      zoom: 2,
    });
  });
});

describe('Somalia default view', () => {
  it('bounds and centre/zoom view describe the same place', () => {
    const [[south, west], [north, east]] = SOMALIA_BOUNDS;
    expect((south + north) / 2).toBeCloseTo(SOMALIA_VIEW.center.lat, 1);
    expect((west + east) / 2).toBeCloseTo(SOMALIA_VIEW.center.lng, 1);
  });
});

describe('boundsOf', () => {
  it('is null for no points, so the map stays on Somalia', () => {
    expect(boundsOf([])).toBeNull();
  });

  it('wraps one or more points', () => {
    expect(boundsOf([{ lat: 2, lng: 45 }])).toEqual([[2, 45], [2, 45]]);
    expect(
      boundsOf([
        { lat: 4.7, lng: 45.2 },
        { lat: -0.4, lng: 42.6 },
        { lat: 2.8, lng: 45.5 },
      ]),
    ).toEqual([[-0.4, 42.6], [4.7, 45.5]]);
  });
});
