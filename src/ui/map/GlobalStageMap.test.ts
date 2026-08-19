import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'GlobalStageMap.tsx'),
  'utf8',
);

describe('GlobalStageMap', () => {
  it('jumps events with next/back, uses normal map zoom, and opens a popup on hover', () => {
    expect(source).toContain('NavigationControl');
    expect(source).toContain('Previous event');
    expect(source).toContain('Next event');
    expect(source).toContain('mouseenter');
    expect(source).toContain('new Popup');
    expect(source).toContain('tourPopupHtml');
    expect(source).toContain('easeTo');
    expect(source).toContain('setProjection');
    expect(source).toContain('Back to main');
    expect(source).toContain('ICE Institute at Global Stage');
    expect(source).not.toContain('scrollZoom.disable');
    expect(source).not.toContain("addEventListener('wheel'");
    expect(source).not.toContain('EventSlider');
    expect(source).not.toContain('tour-right-stack');
    expect(source).not.toContain('DateReel');
    expect(source).not.toContain('tour-play-bar');
    expect(source).not.toContain('createPlaneMarker');
    expect(source).not.toContain('ContinentCards');
    expect(source).not.toContain('SiteFooter');
  });
});
