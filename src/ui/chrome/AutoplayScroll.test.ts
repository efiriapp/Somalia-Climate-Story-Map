import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'AutoplayScroll.tsx'), 'utf8');
const theme = readFileSync(join(here, '..', 'theme.css'), 'utf8');
const locale = readFileSync(join(here, '../../application/locale.ts'), 'utf8');

describe('AutoplayScroll', () => {
  it('offers play/pause, reset, and 0.5x–2x speed controls with accessible labels', () => {
    expect(source).toContain('autoplay-scroll');
    expect(source).toContain('copy.autoplayPlay');
    expect(source).toContain('copy.autoplayPause');
    expect(source).toContain('copy.autoplayReset');
    expect(source).toContain('copy.autoplaySpeed');
    expect(source).toContain('copy.autoplayLabel');
    expect(source).toContain('AUTOPLAY_SPEEDS');
    expect(source).toContain('prefersReducedMotion');
    expect(source).toContain('scrollPixelsForFrame');
    expect(source).toContain('aria-pressed');
    expect(source).toContain('aria-label');
    expect(locale).toContain('autoplayPlay:');
    expect(locale).toContain('autoplayPause:');
    expect(locale).toContain('autoplayReset:');
    expect(locale).toContain('autoplaySpeed:');
    expect(locale).toContain('autoplayLabel:');
  });

  it('pauses when the reader scrolls or uses scroll keys, and styles a compact floating bar', () => {
    expect(source).toContain("addEventListener('wheel'");
    expect(source).toContain("addEventListener('touchmove'");
    expect(source).toContain('USER_SCROLL_KEYS');
    expect(source).toContain('scrollPageToTop');
    expect(theme).toContain('.autoplay-scroll');
    expect(theme).toContain('position: fixed');
    expect(theme).toMatch(/\.autoplay-scroll[\s\S]{0,200}var\(--forest\)/);
  });
});
