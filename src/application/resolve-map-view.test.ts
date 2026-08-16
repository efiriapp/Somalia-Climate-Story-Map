import { describe, expect, it } from 'vitest';
import { resolveMapView } from './resolve-map-view';
import { defaultFilterCriteria, type Story } from '../domain/story';

const pin = (id: string, type: Story['type']): Story => ({
  id,
  title: id,
  type,
  date: '2024-01-01',
  themes: [],
  sdgs: [13],
  location: { name: 'Mogadishu', lat: 2.05, lng: 45.32 },
  summary: '',
  body: '',
  images: [],
});

describe('resolveMapView', () => {
  it('frames Somalia for ICE stories', () => {
    expect(resolveMapView(defaultFilterCriteria(), [pin('a', 'ice-story')])).toEqual({
      center: { lat: 5.15, lng: 46.2 },
      zoom: 6,
    });
  });

  it('frames the world for Global Stage', () => {
    const criteria = { ...defaultFilterCriteria(), type: 'global-stage' as const };
    expect(resolveMapView(criteria, [pin('a', 'global-stage')])).toEqual({
      center: { lat: 15, lng: 20 },
      zoom: 2,
    });
  });

  it('frames the world when every match is Global Stage', () => {
    const criteria = { ...defaultFilterCriteria(), type: 'all' as const };
    expect(resolveMapView(criteria, [pin('a', 'global-stage')])).toEqual({
      center: { lat: 15, lng: 20 },
      zoom: 2,
    });
  });
});
