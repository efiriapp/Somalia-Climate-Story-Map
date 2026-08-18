import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'App.tsx'), 'utf8');

describe('platform topbar', () => {
  it('places the platform title between the SIMAD and ICE logos', () => {
    expect(source).toContain('src="/logos/simad.webp"');
    expect(source).toContain('src="/logos/ice-mark.png"');
    expect(source).toContain('Somali Climate Storytelling Map Platform');
    expect(source).not.toContain('Climate Story Map | Somalia');
    expect(source).toMatch(
      /topbar-logo[\s\S]+topbar-title[\s\S]+Somali Climate Storytelling Map Platform[\s\S]+topbar-logo ice/,
    );
  });
});
