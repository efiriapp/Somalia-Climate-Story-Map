import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'StoryMapTour.tsx'), 'utf8');

describe('StoryMapTour', () => {
  it('uses a full map, district-named pins, and a slider of image then title then description', () => {
    expect(source).toContain('buildStoryMapTour');
    expect(source).toContain('tour-right-stack');
    expect(source).toContain('event-slider');
    expect(source).toContain('event-card');
    expect(source).toMatch(/activeStop\.images\[0\][\s\S]{0,80}<h3>\{activeStop\.title\}<\/h3>[\s\S]{0,80}<p>\{activeStop\.description\}<\/p>/);
    expect(source).toContain('stop.district');
    expect(source).toContain('tour-pin-label');
    expect(source).toContain('CITY_ZOOM');
    expect(source).toContain("new Marker");
    expect(source).toContain('Back');
    expect(source).toContain('Next');
  });
});
