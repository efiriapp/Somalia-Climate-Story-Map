import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'GlobalStageMap.tsx'),
  'utf8',
);

describe('GlobalStageMap', () => {
  it('tours date-sorted places with classic pins, city zoom, and a center-right card', () => {
    expect(source).toContain('a.date.localeCompare');
    expect(source).toContain('COUNTRY_ZOOM');
    expect(source).toContain('CITY_ZOOM');
    expect(source).toContain('CITY_EASE_MS');
    expect(source).toContain('MOGADISHU_HOME.lng');
    expect(source).not.toContain('flyToStop(token, { lng: stop.lng, lat: stop.lat }, next)');
    expect(source).toContain("new Marker({ color:");
    expect(source).toContain('tour-right-stack');
    expect(source).toContain('event-card');
    expect(source).toContain("addEventListener('mouseenter'");
    expect(source).toContain("addEventListener('click'");
    expect(source).toContain('new Popup');
    expect(source).not.toContain('labeledPin');
    expect(source).not.toContain("addEventListener('wheel'");
    expect(source).not.toContain('createPlaneMarker');
    expect(source).not.toContain('setPlaying(true)');
  });
});
