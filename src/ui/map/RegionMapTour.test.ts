import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'RegionMapTour.tsx'), 'utf8');

describe('RegionMapTour', () => {
  it('uses OpenStreetMap tiles, region pins, and a slider of image then title then description', () => {
    expect(source).toContain('tile.openstreetmap.org');
    expect(source).not.toContain('basemaps.cartocdn.com');
    expect(source).toContain('buildRegionMapTour');
    expect(source).toContain('activeStop.district');
    expect(source).toContain('region-pin-label');
    expect(source).toContain('tour-right-stack');
    expect(source).toContain('DISTRICT_ZOOM');
    expect(source).toContain('SOMALIA_VIEW');
    expect(source).toContain('flyToSomaliaThenDistrict');
    expect(source).toContain('scrollWheelZoom={false}');
    expect(source).toContain('onWheel');
    expect(source).toContain('scrollTourIndex');
    expect(source).toContain('activeStop.district');
    expect(source).not.toContain('stops.map((stop, index)');
    expect(source).toMatch(
      /activeStop\.images\[0\][\s\S]{0,80}<h3>\{activeStop\.title\}<\/h3>[\s\S]{0,80}<p>\{activeStop\.description\}<\/p>/,
    );
    expect(source).toContain('event-card-slide');
    expect(source).toContain('Back');
    expect(source).toContain('Next');
  });
});
