import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'GlobalStageMap.tsx'),
  'utf8',
);

describe('GlobalStageMap', () => {
  it('scrolls the 3D globe through events and shows the active one as a popup', () => {
    expect(source).toContain('tour-popup-card');
    expect(source).toContain('tourPopupHtml');
    expect(source).toContain('wheel');
    expect(source).toContain('scrollZoom');
    expect(source).toContain('easeTo');
    expect(source).toContain('setProjection');
    expect(source).toContain('Back to main');
    expect(source).toContain('ICE Institute at Global Stage');
    expect(source).not.toContain('EventSlider');
    expect(source).not.toContain('tour-right-stack');
    expect(source).not.toContain('DateReel');
    expect(source).not.toContain('tour-play-bar');
    expect(source).not.toContain('createPlaneMarker');
    expect(source).not.toContain('tour-plane');
    expect(source).not.toContain('ContinentCards');
    expect(source).not.toContain('ContinentSummaryCards');
    expect(source).not.toContain('TourFilterSlide');
    expect(source).not.toContain('flight-trail-canvas');
    expect(source).not.toContain('SiteFooter');
  });
});
