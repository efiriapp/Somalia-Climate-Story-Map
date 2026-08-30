import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'App.tsx'), 'utf8');

describe('platform topbar', () => {
  it('places the platform title between the SIMAD and ICE logos', () => {
    expect(source).toContain('src="/logos/simad.webp"');
    expect(source).toContain('src="/logos/ice-mark.png"');
    expect(source).toContain('Somali Climate Data Storytelling Platform');
    expect(source).not.toContain('Climate Story Map | Somalia');
    expect(source).toMatch(
      /topbar-logo[\s\S]+topbar-title[\s\S]+Somali Climate Data Storytelling Platform[\s\S]+topbar-logo ice/,
    );
  });

  it('places About, Research, Stories, then ICE at Global Stage as a full-screen globe', () => {
    expect(source).toContain('About ICE Institute');
    expect(source).toContain('ICE Institute Research Stories');
    expect(source).toContain('ICE at Global Stage');
    expect(source).toMatch(
      /About ICE Institute[\s\S]+ICE Institute Research Stories[\s\S]+>[\s\n]*Stories[\s\n]*<[\s\S]+ICE at Global Stage/,
    );
    expect(source).toContain("openScreen('global-stage')");
    expect(source).toContain('GlobalStageMap');
    expect(source).not.toContain('GlobalStagePage');
    expect(source).toContain("openScreen('about')");
    expect(source).toContain("openScreen('research')");
    expect(source).toContain('aboutIce');
    expect(source).toContain("'research-story'");
  });

  it('scrolls to the top of the page when a catalog story opens', () => {
    expect(source).toContain('window.scrollTo(0, 0)');
    expect(source).toMatch(/selectedId[\s\S]{0,180}window\.scrollTo\(0, 0\)/);
  });
});
