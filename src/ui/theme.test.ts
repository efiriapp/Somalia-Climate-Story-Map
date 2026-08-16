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

  it('keeps tour popups on top of the map and airplane', () => {
    const css = readFileSync(themePath, 'utf8');
    expect(css).toMatch(/\.maplibregl-popup[\s\S]{0,40}\.tour-popup[\s\S]{0,40}z-index:\s*50/);
    expect(css).toMatch(/\.maplibregl-marker[\s\S]{0,40}z-index:\s*1/);
  });
});
