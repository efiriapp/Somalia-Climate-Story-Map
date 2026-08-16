import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const themePath = join(dirname(fileURLToPath(import.meta.url)), 'theme.css');

describe('ICE green brand', () => {
  it('uses forest green and never IOM blue', () => {
    const css = readFileSync(themePath, 'utf8');
    expect(css).toContain('#063D39');
    expect(css).toContain('#4CAF7D');
    expect(css).not.toMatch(/#003399|#0047AB|#0A3161|#1B4F9C|#0033cc/i);
  });

  it('keeps the airplane marker above country pins', () => {
    const css = readFileSync(themePath, 'utf8');
    expect(css).toMatch(/\.maplibregl-marker:has\(\.tour-plane\)[\s\S]{0,40}z-index:\s*[3-9]/);
  });

  it('places the ICE calendar in the top-right corner', () => {
    const css = readFileSync(themePath, 'utf8');
    expect(css).toMatch(/\.date-reel[\s\S]{0,80}right:\s*0/);
    expect(css).toMatch(/\.date-reel[\s\S]{0,120}top:\s*0/);
    expect(css).toMatch(/\.date-reel[\s\S]{0,280}#063D39/);
    expect(css).toMatch(/\.tour-title[\s\S]{0,140}left:\s*50%/);
  });

  it('keeps the centered tour popup fully visible', () => {
    const css = readFileSync(themePath, 'utf8');
    expect(css).toMatch(/\.tour-popup-card[\s\S]{0,120}left:\s*50%/);
    expect(css).toMatch(/\.tour-popup-card[\s\S]{0,160}translate\(-50%/);
  });
});
