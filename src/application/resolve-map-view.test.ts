import { describe, expect, it } from 'vitest';
import { resolveMapView } from './resolve-map-view';
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
