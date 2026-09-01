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

  it('tours date-sorted places with classic pins, country zoom, and a center-right card', () => {
    expect(source).toContain('a.date.localeCompare');
    expect(source).toMatch(/center: \[stop\.lng, stop\.lat\][\s\S]{0,80}COUNTRY_ZOOM/);
    expect(source).not.toContain('CITY_ZOOM');
    expect(source).not.toContain('CITY_EASE_MS');
    expect(source).toContain('MOGADISHU_HOME.lng');
    expect(source).not.toContain('flyToStop(token, { lng: stop.lng, lat: stop.lat }, next)');
    expect(source).toContain("HOME_PIN = '#063D39'");
    expect(source).toContain("EVENT_PIN = '#2E7D57'");
    expect(source).toContain('showAllPins');
    expect(source).not.toContain('showEventPin');
    expect(source).not.toContain("className = 'tour-pin'");
    expect(source).not.toContain('tour-pin-label');
    expect(source).not.toContain('formatTourDate(stop.date)');
    expect(source).toContain('tour-right-stack');
    expect(source).toContain('event-card');
    expect(source).toContain("addEventListener('click'");
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

  it('shows a Total visit count inside the continent cards', () => {
    expect(source).toContain('ContinentSummaryCards');
    expect(source).toContain('summaryTotal');
    expect(source).toContain('tour-left-stack');
    expect(source).not.toContain('totalTravelKm');
  });

  it('keeps every location pin on the map and always shows the right-side info after a tap', () => {
    expect(source).toContain('showAllPins(map)');
    expect(source).toContain('openStop');
    expect(source).toMatch(/const openStop[\s\S]{0,280}setTourCard\(stop\)/);
    expect(source).not.toContain('POPUP_HOLD_MS');
    expect(source).not.toContain('flyToIceOffice');
    expect(source).not.toContain('showPinPopup');
    expect(source).not.toContain('new Popup');
  });

  it('tours the map with Back and Next and closes the stayed right-side card with X', () => {
    expect(source).toContain('tour-event-nav');
    expect(source).toContain('stepEvent');
    expect(source).toMatch(/>\s*Back\s*</);
    expect(source).toMatch(/>\s*Next\s*</);
    expect(source).toContain('event-card-close');
    expect(source).toContain('aria-label="Close event"');
    expect(source).toContain('setTourCard(null)');
  });

  it('hides the right-side card until the tour lands on a pin, holds 5s, then returns home to Somalia', () => {
    expect(source).toContain('PIN_HOLD_MS = 5000');
    expect(source).toContain('flyHomeToSomalia');
    expect(source).toContain('COUNTRY_ZOOM');
    expect(source).toMatch(/touringRef\.current = true[\s\S]{0,180}setTourCard\(null\)/);
    expect(source).toMatch(/jumpToView\(map, end[\s\S]{0,220}setTourCard\(stop\)/);
    expect(source).toMatch(/PIN_HOLD_MS[\s\S]{0,220}flyHomeToSomalia/);
  });

  it('leaves the map still until Next starts the tour', () => {
    expect(source).toContain('showAllPins(map)');
    expect(source).not.toMatch(/showAllPins\(map\);[\s\S]{0,200}runPlaceTour/);
    expect(source).not.toContain('eventsRef.current[0]');
    expect(source).toContain('onClick={() => stepEvent(1)}');
  });

  it('jumps the tour from place to place and waits for tiles to settle without panning across the world', () => {
    expect(source).toContain('TILE_SETTLE_MS = 900');
    expect(source).toContain('jumpToView');
    expect(source).toContain('jumpTo');
    expect(source).toMatch(/jumpTo\(\{[\s\S]{0,180}zoom:\s*COUNTRY_ZOOM/);
    expect(source).toContain("once('idle'");
    expect(source).toContain('fadeDuration: 300');
    expect(source).not.toContain('cruiseThenArrive');
    expect(source).not.toContain('PLACE_FLY_MS');
    expect(source).not.toContain('TOUR_FLY_MS');
    expect(source).not.toContain('HOME_FLY_MS');
    expect(source).not.toContain('requestAnimationFrame');
    expect(source).not.toContain('CRUISE_ZOOM');
    expect(source).toContain('refreshExpiredTiles: false');
    expect(source).not.toContain('tourCard ? 332');
    expect(source).toContain('right: 332');
  });

  it('turns the destination pin red while the tour flies to that place', () => {
    expect(source).toContain("ACTIVE_PIN = '#C62828'");
    expect(source).toContain('showAllPins(map, stop.storyId)');
    expect(source).toMatch(/flyHomeToSomalia[\s\S]{0,220}showAllPins\(map,\s*'home'\)/);
    expect(source).toMatch(/showAllPins = \(map: Map, activeId[\s\S]{0,80}null/);
  });

  it('returns home to Somalia at country-level zoom with a jump, not a long pan', () => {
    expect(source).toContain('HOME_HOLD_MS = 4000');
    expect(source).toContain('HOME_HOLD_MS');
    expect(source).toMatch(/zoom:\s*COUNTRY_ZOOM/);
    expect(source).toMatch(/new Map\(\{[\s\S]{0,280}zoom:\s*COUNTRY_ZOOM/);
    expect(source).toMatch(/new Map\(\{[\s\S]{0,200}SOMALIA_HOME/);
    expect(source).toMatch(/goHome[\s\S]{0,900}SOMALIA_HOME/);
    expect(source).toMatch(/flyHomeToSomalia[\s\S]{0,500}jumpToView/);
    expect(source).toContain('.setLngLat([MOGADISHU_HOME.lng, MOGADISHU_HOME.lat])');
    expect(source).not.toContain('landAtHome');
  });
});
