import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'GlobalStageMap.tsx'),
  'utf8',
);

describe('GlobalStageMap', () => {
  it('uses Next/Back, a centered popup, and home/search/measure/compass tools', () => {
    expect(source).toMatch(/>\s*Back\s*</);
    expect(source).toMatch(/>\s*Next\s*</);
    expect(source).toContain('Search tour');
    expect(source).toContain('Go home');
    expect(source).toContain('Measure distance');
    expect(source).toContain('Reset compass');
    expect(source).toContain('tour-popup-card');
    expect(source).toContain('tourPopupHtml');
    expect(source).toContain('mouseenter');
    expect(source).toContain('NavigationControl');
    expect(source).toContain('easeTo');
    expect(source).toContain('GLOBE_VIEW');
    expect(source).not.toContain('new Popup');
    expect(source).not.toContain("addEventListener('wheel'");
    expect(source).not.toContain('EventSlider');
    expect(source).not.toContain('createPlaneMarker');
    expect(source).not.toContain('SiteFooter');
  });
});
