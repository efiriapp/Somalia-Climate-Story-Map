import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'GlobalStageMap.tsx'),
  'utf8',
);

describe('GlobalStageMap airplane marker', () => {
  it('sets a LngLat on the plane before adding it to the map', () => {
    expect(source).toMatch(/createPlaneMarker\(\)[\s\S]{0,120}\.setLngLat\([\s\S]{0,80}\)\s*\.addTo\(map\)/);
  });

  it('moves the camera and tracking line on the same slow flight clock as the airplane', () => {
    expect(source).toContain('FLIGHT_MS');
    expect(source).toContain('TOUR_STEP_MS');
    expect(source).toContain('jumpTo');
    expect(source).not.toMatch(/duration:\s*moved \? FLIGHT_MS/);
  });
});
