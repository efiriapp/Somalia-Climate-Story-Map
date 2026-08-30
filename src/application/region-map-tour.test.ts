import { describe, expect, it } from 'vitest';
import { stories } from '../content/stories';
import { regionCenter } from './region-coordinates';
import { buildRegionMapTour } from './region-map-tour';

describe('buildRegionMapTour', () => {
  it('tours SIMAD drought region by region from Mudug to Lower Juba', () => {
    const story = stories.find((item) => item.id === 'simad-drought');
    const tour = buildRegionMapTour(story!);

    expect(tour.map((stop) => stop.region)).toEqual(['Mudug', 'Baay', 'Hiiraan', 'Lower Juba']);
    expect(tour[0]?.title).toBe('Mudug: water for families and livestock');
    expect(tour.at(-1)?.title).toBe('Lower Juba: pastoralists and farmers');
    expect(tour[0]).toMatchObject({
      ...regionCenter('mudug'),
      district: 'Hobyo',
      images: ['/logos/simad.webp'],
    });
    expect(tour.at(-1)).toMatchObject({
      ...regionCenter('lower-juba'),
      district: 'Kismaayo',
    });
    for (const stop of tour) {
      const sentences = stop.description.split(/(?<=[.!?])\s+/).filter(Boolean);
      expect(stop.images[0]).toBe('/logos/simad.webp');
      expect(sentences.length).toBeGreaterThanOrEqual(5);
      expect(sentences.length).toBeLessThanOrEqual(7);
    }
  });
});
