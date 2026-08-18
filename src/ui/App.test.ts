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

  it('places About and Research Stories before Stories and Global Stage', () => {
    expect(source).toContain('About ICE Institute');
    expect(source).toContain('ICE Institute Research Stories');
    expect(source).toMatch(
      /About ICE Institute[\s\S]+ICE Institute Research Stories[\s\S]+>[\s\n]*Stories[\s\n]*<[\s\S]+ICE Institute at Global Stage/,
    );
    expect(source).toContain("openScreen('about')");
    expect(source).toContain("openScreen('research')");
    expect(source).toContain('aboutIce');
    expect(source).toContain("'research-story'");
  });
});
