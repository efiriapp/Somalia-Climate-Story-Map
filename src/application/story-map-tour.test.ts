import { describe, expect, it } from 'vitest';
import { stories } from '../content/stories';
import { districtCenter } from './district-coordinates';
import { buildStoryMapTour } from './story-map-tour';

describe('buildStoryMapTour', () => {
  it('tours SIMAD drought from Hobyo in Mudug to Kismaayo in Lower Juba', () => {
    const story = stories.find((item) => item.id === 'simad-drought');
    const tour = buildStoryMapTour(story!);

    expect(tour.map((stop) => stop.district)).toEqual([
      'Hobyo',
      'Baidoa',
      'Jalalaqsi',
      'Belet Weyne',
      'Kismaayo',
    ]);
    expect(tour[0]?.title).toBe('Mudug: water for families and livestock');
    expect(tour.at(-1)?.title).toBe('Lower Juba: pastoralists and farmers');
    expect(tour[0]).toMatchObject({
      ...districtCenter('hobyo'),
      images: ['/logos/simad.webp'],
    });
    expect(tour.at(-1)).toMatchObject(districtCenter('kismaayo'));
    for (const stop of tour) {
      expect(stop.images[0]).toBeTruthy();
      expect(stop.title.length).toBeGreaterThan(0);
      expect(stop.description.length).toBeGreaterThan(40);
    }
  });
});
