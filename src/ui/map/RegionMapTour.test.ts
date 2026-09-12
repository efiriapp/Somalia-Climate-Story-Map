import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'RegionMapTour.tsx'), 'utf8');

describe('RegionMapTour', () => {
  it('defaults to Streets Equal Earth with a layers icon toggle for Satellite and Terrain', () => {
    expect(source).toContain('EqualEarthBasemap');
    expect(source).toContain('MapBasemapControl');
    expect(source).toContain('DEFAULT_MAP_LAYER');
    expect(source).toContain("useState<MapLayerId>(DEFAULT_MAP_LAYER)");
    expect(source).toContain('basemap={basemap}');
    expect(source).toContain('Icon.Default');
    expect(source).not.toContain('LayersControl');
    expect(source).not.toContain('basemaps.cartocdn.com');
    expect(source).not.toContain('arcgisonline');
    expect(source).not.toContain('World_Imagery');
    expect(source).not.toMatch(/name="Satellite"[\s\S]{0,40}checked/);
    expect(source).not.toMatch(/name="Terrain"[\s\S]{0,80}checked/);
    expect(source).toContain('buildRegionMapTour');
    expect(source).toContain('stop.district');
    expect(source).toContain('<Popup');
    expect(source).toContain('region-pin-popup');
    expect(source).toContain('stop.district');
    expect(source).toContain('SOMALIA_VIEW');
    expect(source).toContain('flyTo');
    expect(source).toContain('setView');
    expect(source).toContain('ORIGIN_HOLD_MS');
    expect(source).toContain('DISTRICT_FLY_MS');
    expect(source).toContain('stop.zoom');
    expect(source).not.toContain('animate: false');
    expect(source).toContain('useState(-1)');
    expect(source).toContain('scrollWheelZoom={false}');
    expect(source).toContain('onWheel');
    expect(source).toContain('scrollTourIndex');
    expect(source).toContain('sliderOpen');
    expect(source).toContain('region-slide-card');
    expect(source).toContain('region-map-tour-screen');
    expect(source).toContain('whenReady');
    expect(source).toContain('scrollPageToTop');
    expect(source).toContain('capture: true');
    expect(source).toContain('tourFlightPlan');
    expect(source).toContain('setSliderOpen(false)');
    expect(source).toContain('setSliderOpen(true)');
    expect(source).toContain('stops.map((stop)');
    expect(source).toContain('copy.tourBack');
    expect(source).toContain('copy.tourNext');
    expect(source).toContain('stepDistrict');
    expect(source).toContain('useOptionalAutoplay');
    expect(source).toContain('autoplayTourDwellMs');
    expect(source).toContain('nextAutoplayTourIndex');
    expect(source).toContain('IntersectionObserver');
    expect(source).toContain('setHoldScroll');
    expect(source).toContain('pauseAutoplay');
    expect(source).not.toContain('tour-right-stack');
    expect(source).not.toContain('event-slider');
    expect(source).toMatch(
      /activeStop\.images\[0\][\s\S]{0,80}<h3>\{activeStop\.title\}<\/h3>[\s\S]{0,80}<p>\{activeStop\.description\}<\/p>/,
    );
    expect(source).not.toContain('activeStop.images.map');
    expect(source).not.toContain('region-slide-photos');
  });

  it('credits the tour slide photo with the ICE story source line', () => {
    expect(source).toContain('MediaSourceCredit');
    expect(source).toContain('storyMediaCredit(story)');
    expect(source.lastIndexOf('MediaSourceCredit')).toBeGreaterThan(source.lastIndexOf('activeStop.description'));
  });

  it('keeps the Leaflet pin and does not show name labels', () => {
    expect(source).toContain('Icon.Default');
    expect(source).not.toContain('L.divIcon');
    expect(source).not.toContain('districtPinMarkup');
    expect(source).not.toContain('<Tooltip');
    expect(source).not.toContain('districtLabelClass');
    expect(source).toContain('stop.flyLat');
    expect(source).toContain('stop.zoom');
  });
});
