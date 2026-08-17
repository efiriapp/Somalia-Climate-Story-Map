import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'GlobalStageMap.tsx'),
  'utf8',
);
const dateReel = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'DateReel.tsx'),
  'utf8',
);
const continentCards = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'ContinentCards.tsx'),
  'utf8',
);

describe('GlobalStageMap airplane marker', () => {
  it('sets a LngLat on the plane before adding it to the map', () => {
    expect(source).toMatch(/createPlaneMarker\(\)[\s\S]{0,120}\.setLngLat\([\s\S]{0,80}\)\s*\.addTo\(map\)/);
  });

  it('moves the airplane, travel line, and map tour on the same slow clock', () => {
    expect(source).toContain('FLIGHT_MS');
    expect(source).toContain('POPUP_HOLD_MS');
    expect(source).toContain('GLOBE_VIEW');
    expect(source).toContain('slicePath');
    expect(source).toContain('flight-trail-canvas');
    expect(source).toContain('setLineDash');
    expect(source).toMatch(/onTrail[\s\S]{0,400}paintTrail\(/);
    expect(source).not.toContain('line-trim-offset');
    expect(source).toContain('CAMERA_MS');
    expect(source).toContain('cruiseThenArrive');
    expect(source).toContain('followFlight');
    expect(source).not.toContain('fitBounds');
    expect(source).not.toMatch(/duration:\s*moved \? FLIGHT_MS/);
  });

  it('keeps cruise zoom so map layers stay clear until the airplane arrives', () => {
    expect(source).toContain('CRUISE_ZOOM');
    expect(source).toContain('fadeDuration: 0');
    expect(source).toContain('setPadding(GLOBE_PADDING)');
    expect(source).toMatch(/now - lastCamera[\s\S]{0,80}CAMERA_MS/);
  });

  it('keeps the airplane visible until it lands, then eases to city zoom', () => {
    expect(source).toContain('FOLLOW_MAX_ZOOM');
    expect(source).toContain('arriveHeading');
    expect(source).toContain('cityLocked');
    expect(source).toContain('CITY_EASE_MS');
    expect(source).not.toMatch(/stop\.kind === 'event' && zoom >= FOLLOW_MAX_ZOOM/);
    expect(source).toMatch(/if \(t >= 1\)/);
  });

  it('uses a fullscreen map with icon controls and a rolling date card', () => {
    expect(source).toContain('DateReel');
    expect(source).toContain('isoDate={calendarDate}');
    expect(source).toContain('tour-icon-bar');
    expect(source).toContain('ICE Institute at Global Stage');
    expect(source).toContain('Back to main');
    expect(source).toContain('tour-play-bar');
    expect(source).toContain('SkipBackIcon');
    expect(source).toContain('SkipForthIcon');
    expect(source).toContain('PlayCircleIcon');
    expect(source).not.toContain('global-stage-bar');
    expect(source).not.toContain('NavigationControl');
    expect(source).toContain('flight-trail-canvas');
  });

  it("labels the date card as ICE Institute's calendar", () => {
    expect(dateReel).toContain("ICE Institute's calendar");
    expect(dateReel).toContain('label="DAY"');
    expect(dateReel).not.toContain('label="Date"');
    expect(dateReel).toContain('onWheel');
    expect(dateReel).toContain('onDateChange');
    expect(dateReel).toContain('playCalendarTick');
  });

  it('opens the event popup 1 second after city zoom, as a centered card', () => {
    expect(source).toContain('POPUP_DELAY_MS');
    expect(source).toContain('tour-popup-card');
    expect(source).toContain('setPopupOpen');
    expect(source).not.toMatch(/\.addTo\(map\)\s*\n\s*\.togglePopup\(\)/);
    expect(source).toMatch(/setTimeout\([\s\S]{0,220}setPopupOpen\(true\)[\s\S]{0,80}POPUP_DELAY_MS/);
  });

  it('holds the popup 5 seconds on play, then flies home', () => {
    expect(source).toContain('POPUP_HOLD_MS');
    expect(source).toContain('queueNextIfPlaying');
    expect(source).toMatch(/setPopupOpen\(true\)[\s\S]{0,80}queueNextIfPlaying\(POPUP_HOLD_MS\)/);
    expect(source).not.toMatch(/setInterval\(/);
  });

  it('updates the calendar only when the airplane arrives home', () => {
    expect(source).toContain('isoDate={calendarDate}');
    expect(source).toMatch(/if \(stop\.kind === 'home'\)[\s\S]{0,80}setCalendarDate\(stop\.date\)/);
    expect(source).toContain('onDateChange');
    expect(source).toContain('firstEventIndexForDate');
  });

  it('freezes the airplane in place when the tour is paused', () => {
    expect(source).toMatch(/if \(!playingRef\.current\)/);
    expect(source).toContain('flightTickRef');
    expect(source).toContain('pauseMs');
  });

  it('starts still and only animates after the user presses play', () => {
    expect(source).not.toContain('autoStartedRef');
    expect(source).not.toMatch(/setPlaying\(true\)/);
  });

  it('starts filtered flights from Mogadishu home', () => {
    expect(source).toContain('goToStopFromHome');
    expect(source).toMatch(/lastIndexRef\.current = 0/);
    expect(source).toContain('MOGADISHU_HOME');
    expect(source).toContain('playTakeoffSound');
    expect(source).toContain('startFlightSound');
    expect(source).toContain('playLandingSound');
    expect(source).toContain('unlockTourSound');
    expect(source).toContain('setTourSoundVolume');
    expect(source).toContain('tour-volume-slider');
    expect(source).toContain('aria-label="Sound volume"');
    expect(source).toContain('SoundIcon');
    expect(source).not.toContain('Sound settings');
  });

  it('keeps the airplane marker on top of map pins and trail', () => {
    expect(source).toContain('tour-plane');
  });

  it('adds search, home, compass, and length measure after map layers', () => {
    expect(source).toContain('aria-label="Search tour"');
    expect(source).toContain('aria-label="Home view"');
    expect(source).toContain('aria-label="Compass north"');
    expect(source).toContain('aria-label="Measure length"');
    expect(source).toContain('distanceKm');
    expect(source).toContain('ContinentCards');
    expect(source).toContain('tallyContinentVisits');
    expect(source).toContain('visitedCountries');
    expect(source).toContain('tour-search-panel');
    expect(source).toContain('onReset');
    expect(source).toContain('showPath');
    expect(source).toContain('Hide path');
    expect(source).toContain('Show path');
    expect(source).toContain('TourFilterSlide');
    expect(source).toContain('Show filters');
    expect(source).toContain('Hide filters');
    expect(source).toContain('constrainTourFilter');
    expect(source).toContain('ContinentSummaryCards');
    expect(source).not.toContain('Show continent cards');
    expect(source).not.toContain('Hide continent cards');
    expect(source).not.toContain('CardsIcon');
    expect(source).toContain('firstEventIndexMatching');
    expect(source).toContain('onContinent');
    expect(source).toContain('onTotal');
    expect(source).toContain('summaryTotal');
    expect(source).not.toContain('continentSummaries(stories, defaultTourFilter())');
    expect(source).toContain('>ICE Institute at Global Stage<');
    expect(source).not.toContain('<span>ICE Institute</span>');
    expect(source).toContain('tour-tool-bar');
    expect(source).toMatch(
      /tour-tool-bar[\s\S]+aria-label="Home view"[\s\S]+aria-label="Measure length"[\s\S]+aria-label="Compass north"[\s\S]+aria-label="Map layers"/,
    );
  });

  it('leaves empty continent cells blank instead of writing zero', () => {
    expect(continentCards).toContain('aria-label="Reset table"');
    expect(continentCards).not.toContain('<span>0</span>');
    expect(continentCards).toMatch(/card\.visited === 0 \? ''/);
  });
});
