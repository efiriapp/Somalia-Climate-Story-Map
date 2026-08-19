import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'GlobalStageMap.tsx'),
  'utf8',
);

describe('GlobalStageMap', () => {
  it('tours each place from Mogadishu, shows the pin popup for 7s, then flies home', () => {
    expect(source).toMatch(/>\s*Back\s*</);
    expect(source).toMatch(/>\s*Next\s*</);
    expect(source).toContain('MOGADISHU_HOME');
    expect(source).toContain('greatCircle');
    expect(source).toContain('slicePath');
    expect(source).toContain('new Popup');
    expect(source).toContain('POPUP_HOLD_MS');
    expect(source).toContain('tourPopupHtml');
    expect(source).toContain('Search tour');
    expect(source).toContain('Go home');
    expect(source).toContain('Measure distance');
    expect(source).toContain('Reset compass');
    expect(source).toContain('NavigationControl');
    expect(source).not.toContain('tour-popup-card');
    expect(source).not.toContain("addEventListener('wheel'");
    expect(source).not.toContain('EventSlider');
    expect(source).not.toContain('createPlaneMarker');
    expect(source).not.toContain('setPlaying(true)');
    expect(source).not.toContain('SiteFooter');
  });
});
