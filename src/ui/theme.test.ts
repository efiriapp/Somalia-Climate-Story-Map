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
    expect(css).toMatch(/\.tour-plane[\s\S]{0,220}z-index:\s*[2-9][0-9]\s*!important/);
  });

  it('places continent visit cards below the ICE calendar', () => {
    const css = readFileSync(themePath, 'utf8');
    expect(css).toMatch(/\.tour-right-stack[\s\S]{0,80}right:\s*0/);
    expect(css).toMatch(/\.tour-right-stack[\s\S]{0,120}top:\s*0/);
    expect(css).toContain('.continent-board');
    expect(css).toContain('.continent-table');
  });

  it('places the ICE calendar in the top-right corner', () => {
    const css = readFileSync(themePath, 'utf8');
    expect(css).toMatch(/\.date-reel[\s\S]{0,280}#063D39/);
    expect(css).toMatch(/\.tour-title[\s\S]{0,140}left:\s*50%/);
    expect(css).toMatch(/\.tour-title[\s\S]{0,280}background:\s*(#063D39|var\(--forest\))/);
    expect(css).toMatch(/\.tour-play-bar[\s\S]{0,140}border-radius:\s*999px/);
    expect(css).toMatch(/\.tour-play-bar \.play[\s\S]{0,180}border-radius:\s*50%/);
  });

  it('keeps Global Stage calendar text fully white', () => {
    const css = readFileSync(themePath, 'utf8');
    expect(css).toMatch(/\.date-reel-kicker[\s\S]{0,140}color:\s*(#fff|#ffffff|var\(--white\))/i);
    expect(css).toMatch(/\.date-reel-label[\s\S]{0,180}color:\s*(#fff|#ffffff|var\(--white\))/i);
    expect(css).toMatch(/\.date-reel-item[\s\S]{0,200}color:\s*(#fff|#ffffff|var\(--white\))/i);
  });

  it('makes calendar title, dates, and labels large and bold', () => {
    const css = readFileSync(themePath, 'utf8');
    expect(css).toMatch(/\.date-reel-kicker[\s\S]{0,160}font-size:\s*1[2-9]px/);
    expect(css).toMatch(/\.date-reel-kicker[\s\S]{0,180}font-weight:\s*(800|900)/);
    expect(css).toMatch(/\.date-reel-label[\s\S]{0,200}font-size:\s*1[1-9]px/);
    expect(css).toMatch(/\.date-reel-label[\s\S]{0,220}font-weight:\s*(800|900)/);
    expect(css).toMatch(/\.date-reel-item[\s\S]{0,220}font-size:\s*1\.45rem/);
    expect(css).toMatch(/\.date-reel-item[\s\S]{0,240}font-weight:\s*900/);
  });

  it('keeps the centered tour popup fully visible', () => {
    const css = readFileSync(themePath, 'utf8');
    expect(css).toMatch(/\.tour-popup-card[\s\S]{0,120}left:\s*50%/);
    expect(css).toMatch(/\.tour-popup-card[\s\S]{0,160}translate\(-50%/);
  });
});
