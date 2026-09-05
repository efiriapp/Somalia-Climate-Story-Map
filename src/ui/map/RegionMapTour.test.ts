import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'RegionMapTour.tsx'), 'utf8');

describe('RegionMapTour', () => {
  it('uses OpenStreetMap tiles, region pins, and a slider of image then title then description', () => {
    expect(source).toContain('leafletBasemaps');
    expect(source).toContain('LayersControl');
    expect(source).toContain('Icon.Default');
    expect(source).not.toContain('basemaps.cartocdn.com');
    expect(source).not.toContain('arcgisonline');
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
    expect(source).toContain('DISTRICT_ZOOM');
    expect(source).not.toContain('BUILDING_ZOOM');
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
    expect(source).toMatch(/>\s*Back\s*</);
    expect(source).toMatch(/>\s*Next\s*</);
    expect(source).toContain('stepDistrict');
    expect(source).not.toContain('tour-right-stack');
    expect(source).not.toContain('event-slider');
    expect(source).toMatch(
      /activeStop\.images\[0\][\s\S]{0,80}<h3>\{activeStop\.title\}<\/h3>[\s\S]{0,80}<p>\{activeStop\.description\}<\/p>/,
    );
  });

  it('keeps the Leaflet pin and labels it with only the district name', () => {
    expect(source).toContain('Icon.Default');
    expect(source).not.toContain('L.divIcon');
    expect(source).not.toContain('districtPinMarkup');
    expect(source).toContain('<Tooltip');
    expect(source).toContain('permanent');
    expect(source).toContain('{stop.district}');
    expect(source).toContain('districtLabelClass(stop === activeStop)');
    expect(source).toContain('stop === activeStop ? \'on\' : \'off\'');
    expect(source).toMatch(/<Tooltip[\s\S]{0,220}\{stop\.district\}[\s\S]{0,80}<\/Tooltip>/);
    expect(source).not.toMatch(/<Tooltip[\s\S]{0,220}stop\.(title|region)/);
  });
});
