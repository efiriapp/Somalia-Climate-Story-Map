import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'App.tsx'), 'utf8');

describe('platform topbar', () => {
  it('places the platform title between the SIMAD and ICE logos', () => {
    expect(source).toContain('src="/logos/simad.webp"');
    expect(source).toContain('src="/logos/ice-mark.png"');
    expect(source).toContain('copy.platform');
    expect(source).not.toContain('Climate Story Map | Somalia');
    expect(source).toMatch(
      /topbar-logo[\s\S]+topbar-title[\s\S]+copy.platform[\s\S]+topbar-logo ice/,
    );
  });

  it('places About, Research, Stories, Climate Impact, then ICE at Global Stage as a full-screen globe', () => {
    expect(source).toContain('copy.about');
    expect(source).toContain('copy.research');
    expect(source).toContain('copy.stories');
    expect(source).toContain('copy.climateImpact');
    expect(source).toContain('copy.globalStage');
    expect(source).toMatch(
      /copy.about[\s\S]+copy.research[\s\S]+copy.stories[\s\S]+copy.climateImpact[\s\S]+copy.globalStage/,
    );
    expect(source).toContain("openScreen('global-stage')");
    expect(source).toContain("openScreen('climate-impact')");
    expect(source).toContain('ClimateImpactPage');
    expect(source).toContain('GlobalStageMap');
    expect(source).not.toContain('GlobalStagePage');
    expect(source).toContain("openScreen('about')");
    expect(source).toContain("openScreen('research')");
    expect(source).toContain('localizeAbout');
    expect(source).toContain("'research-story'");
    expect(source).toContain('nav-language');
    expect(source).toContain('chromeCopy');
    expect(source.indexOf("openScreen('global-stage')")).toBeLessThan(source.indexOf('nav-language'));
    expect(source).toContain('flagIconUrl');
    expect(source).toContain("flagIconUrl('Somalia')");
    expect(source).toContain("flagIconUrl('United Kingdom')");
    expect(source).toContain('nav-language-label');
    expect(source).toContain('nav-language-en');
    expect(source).toContain('nav-language-so');
    expect(source).toContain('>EN<');
    expect(source).toContain('>SO<');
    expect(source).toContain('nav-language-track');
    expect(source).toContain('nav-language-thumb');
    expect(source).toContain('nav-language-flag');
    expect(source).toContain('aria-pressed');
    expect(source).toMatch(/setLocale\(locale === 'en' \? 'so' : 'en'\)/);
  });

  it('credits research-story photos when the simple detail page shows an image', () => {
    expect(source).toContain('MediaSourceCredit');
    expect(source).toContain('storyMediaCredit(detail)');
  });

  it('scrolls to the top of the page when a catalog story opens', () => {
    expect(source).toContain('useLayoutEffect');
    expect(source).toMatch(/useLayoutEffect\([\s\S]{0,220}scrollPageToTop/);
    expect(source).toMatch(/selectedId[\s\S]{0,220}scrollPageToTop/);
  });

  it('opens related climate hazards and stories through a shared openRelated handler', () => {
    expect(source).toContain('openRelated');
    expect(source).toContain("setScreen('climate-impact')");
    expect(source).toContain('setImpactHazard(target.id)');
    expect(source).toContain("setScreen(story.type === 'research-story' ? 'research' : 'stories')");
    expect(source).toContain('RelatedLinks');
    expect(source).toContain('relatedTargetsForStory');
  });
});
