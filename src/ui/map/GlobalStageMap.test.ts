import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'GlobalStageMap.tsx'),
  'utf8',
);

describe('GlobalStageMap', () => {
  it('uses a free OpenStreetMap style instead of Carto', () => {
    expect(source).toContain("styleForLayer('osm')");
    expect(source).not.toContain('carto-voyager');
    expect(source).not.toContain('basemaps.cartocdn.com');
  });

  it('tours date-sorted places with classic pins, city zoom, and a center-right card', () => {
    expect(source).toContain('a.date.localeCompare');
    expect(source).toMatch(/landAtIceOffice[\s\S]{0,220}COUNTRY_ZOOM/);
    expect(source).toMatch(/center: \[stop\.lng, stop\.lat\][\s\S]{0,80}CITY_ZOOM/);
    expect(source).toContain('showPinPopup(map, stop)');
    expect(source).toContain('CITY_EASE_MS');
    expect(source).toContain('MOGADISHU_HOME.lng');
    expect(source).not.toContain('flyToStop(token, { lng: stop.lng, lat: stop.lat }, next)');
    expect(source).toContain("new Marker({ color: '#063D39' })");
    expect(source).toContain("new Marker({ color: '#2E7D57' })");
    expect(source).toContain('showEventPin(map, stop)');
    expect(source).toContain('showHomePin(map)');
    expect(source).toContain('hidePins()');
    expect(source).not.toContain("className = 'tour-pin'");
    expect(source).not.toContain('tour-pin-label');
    expect(source).not.toContain('formatTourDate(stop.date)');
    expect(source).not.toContain('events.map((stop) => {');
    expect(source).toContain('tour-right-stack');
    expect(source).toContain('event-card');
    expect(source).toContain("addEventListener('click'");
    expect(source).toContain('new Popup');
    expect(source).not.toContain("addEventListener('mouseenter'");
    expect(source).not.toContain('labeledPin');
    expect(source).not.toContain("addEventListener('wheel'");
    expect(source).not.toContain('createPlaneMarker');
    expect(source).not.toContain('setPlaying(true)');
  });

  it('keeps the world map flat 2D globally, with no globe or camera tilt', () => {
    expect(source).not.toContain("type: 'globe'");
    expect(source).toContain("type: 'mercator'");
    expect(source).toContain('maxPitch: 0');
    expect(source).not.toContain('pitch: 24');
    expect(source).not.toContain('pitch: 42');
    expect(source).not.toContain('CRUISE_ZOOM, 28');
    expect(source).toContain('visualizePitch: false');
  });
});
