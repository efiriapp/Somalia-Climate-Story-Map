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

  it('moves the airplane, travel line, and map tour on the same slow clock', () => {
    expect(source).toContain('FLIGHT_MS');
    expect(source).toContain('TOUR_STEP_MS');
    expect(source).toContain('GLOBE_VIEW');
    expect(source).toContain('line-trim-offset');
    expect(source).toContain('jumpTo');
    expect(source).toContain('followFlight');
    expect(source).not.toContain('fitBounds');
    expect(source).not.toMatch(/duration:\s*moved \? FLIGHT_MS/);
  });

  it('zooms with the airplane instead of after it lands', () => {
    expect(source).toContain('followFlight');
    expect(source).toMatch(/followFlight\(map, plane, path, stop, t/);
  });

  it('opens the event popup 3 seconds after the airplane arrives', () => {
    expect(source).toContain('POPUP_DELAY_MS');
    expect(source).not.toMatch(/\.addTo\(map\)\s*\n\s*\.togglePopup\(\)/);
    expect(source).toMatch(/setTimeout\([\s\S]{0,180}togglePopup[\s\S]{0,80}POPUP_DELAY_MS/);
  });
});
