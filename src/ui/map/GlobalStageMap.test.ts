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
    expect(source).toContain('CAMERA_MS');
    expect(source).toContain('cruiseThenArrive');
    expect(source).toContain('followFlight');
    expect(source).not.toContain('fitBounds');
    expect(source).not.toMatch(/duration:\s*moved \? FLIGHT_MS/);
  });

  it('keeps cruise zoom so map layers stay clear until the airplane arrives', () => {
    expect(source).toContain('CRUISE_ZOOM');
    expect(source).toContain('fadeDuration: 0');
    expect(source).toMatch(/now - lastCamera[\s\S]{0,80}CAMERA_MS/);
  });

  it('keeps the airplane glued to a still heading at city zoom', () => {
    expect(source).toContain('FOLLOW_MAX_ZOOM');
    expect(source).toContain('arriveHeading');
    expect(source).toMatch(/zoom >= FOLLOW_MAX_ZOOM/);
  });

  it('opens the event popup 3 seconds after the airplane arrives', () => {
    expect(source).toContain('POPUP_DELAY_MS');
    expect(source).not.toMatch(/\.addTo\(map\)\s*\n\s*\.togglePopup\(\)/);
    expect(source).toMatch(/setTimeout\([\s\S]{0,180}togglePopup[\s\S]{0,80}POPUP_DELAY_MS/);
  });
});
