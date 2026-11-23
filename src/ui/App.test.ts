import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'App.tsx'), 'utf8');

describe('platform topbar', () => {
  it('shows the combined SIMAD + ICE logo, then the title, then the language switcher', () => {
    expect(source).toContain('src="/logos/simad-ice-web.webp"');
    expect(source).not.toContain('src="/logos/simad.webp"');
    expect(source).not.toContain('src="/logos/ice-mark.png"');
    expect(source).toContain('copy.platform');
    expect(source).not.toContain('Climate Story Map | Somalia');
    expect(source).toMatch(
      /topbar-brand[\s\S]+topbar-title[\s\S]+copy.platform[\s\S]+nav-language is-[\s\S]+<\/header>/,
    );
  });

  it('menu runs Research, Stories, Climate Impact, Flood Watch, Drought Watch; Global Stage opens from Stories', () => {
    expect(source).not.toContain("openScreen('about')");
    expect(source).toContain('copy.research');
    expect(source).toContain('copy.stories');
    expect(source).toContain('copy.climateImpact');
    expect(source).toContain('copy.globalStage');
    expect(source).toMatch(
      /copy.research[\s\S]+copy.stories[\s\S]+copy.climateImpact[\s\S]+copy.floodWatch[\s\S]+copy.droughtWatch/,
    );
    expect(source).toContain("openScreen('global-stage')");
    expect(source).toContain("openScreen('climate-impact')");
    expect(source).toContain('ClimateImpactPage');
    expect(source).toContain('GlobalStageMap');
    expect(source).toContain('AutoplayProvider');
    expect(source).not.toContain('GlobalStagePage');
    expect(source).toContain("openScreen('research')");
    expect(source).not.toContain('localizeAbout');
    expect(source).toContain("'research-story'");
    expect(source).toContain('nav-language');
    expect(source).toContain('chromeCopy');
    // The language switcher lives in the header, before the page menu.
    expect(source.indexOf('nav-language')).toBeLessThan(source.indexOf('<nav className="nav"'));
    expect(source).toContain('flagIconUrl');
    expect(source).toContain("flagIconUrl('Somalia')");
    expect(source).toContain("flagIconUrl('United Kingdom')");
    expect(source).toContain("flagIconUrl('Saudi Arabia')");
    expect(source).toContain('nav-language-label');
    expect(source).toContain('nav-language-en');
    expect(source).toContain('nav-language-so');
    expect(source).toContain('nav-language-ar');
    expect(source).toContain('>EN<');
    expect(source).toContain('>SO<');
    expect(source).toContain('>AR<');
    expect(source).toContain('nav-language-track');
    expect(source).toContain('nav-language-thumb');
    expect(source).toContain('nav-language-flag');
    expect(source).toContain('nav-language-flag-en');
    expect(source).toContain('nav-language-flag-so');
    expect(source).toContain('nav-language-flag-ar');
    expect(source).toContain("setLocale('en')");
    expect(source).toContain("setLocale('so')");
    expect(source).toContain("setLocale('ar')");
    expect(source).toMatch(/is-\$\{locale\}|is-en|is-so|is-ar/);
    expect(source).toMatch(/document\.documentElement\.lang\s*=\s*locale/);
    expect(source).toMatch(/document\.documentElement\.dir\s*=\s*locale === 'ar' \? 'rtl' : 'ltr'/);
    expect(source).not.toMatch(/setLocale\(locale === 'en' \? 'so' : 'en'\)/);
    // Each locale button owns its flag so the visible switcher hits setLocale.
    expect(source).toMatch(
      /className="nav-language-option nav-language-en"(?:(?!<\/button>)[\s\S])*nav-language-flag-en(?:(?!<\/button>)[\s\S])*<\/button>/,
    );
    expect(source).toMatch(
      /className="nav-language-option nav-language-so"(?:(?!<\/button>)[\s\S])*nav-language-flag-so(?:(?!<\/button>)[\s\S])*<\/button>/,
    );
    expect(source).toMatch(
      /className="nav-language-option nav-language-ar"(?:(?!<\/button>)[\s\S])*nav-language-flag-ar(?:(?!<\/button>)[\s\S])*<\/button>/,
    );
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
    expect(source).toContain("go({ screen: 'climate-impact', storyId: null, hazard: target.id })");
    expect(source).toContain("screen: story.type === 'research-story' ? 'research' : 'stories'");
    expect(source).toContain('useHashRoute');
    expect(source).toContain('RelatedLinks');
    expect(source).toContain('relatedTargetsForStory');
  });

  it('applies keyword search as the user types', () => {
    expect(source).toContain('setApplied(next)');
    expect(source).toMatch(
      /onChange=\{\(event\) => \{\s*const next = \{ \.\.\.draft, query: event\.target\.value \};\s*setDraft\(next\);\s*setApplied\(next\);/,
    );
  });
});

describe('platform title lines', () => {
  it('splits the title into two lines that read as the full name in every language', async () => {
    const { CHROME } = await import('../application/locale');
    for (const locale of ['en', 'so', 'ar'] as const) {
      expect(CHROME[locale].platformLines).toHaveLength(2);
      expect(CHROME[locale].platformLines.join(' ')).toBe(CHROME[locale].platform);
    }
  });
});
