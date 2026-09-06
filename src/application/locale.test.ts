import { describe, expect, it } from 'vitest';
import { CHROME, chromeCopy, hazardTitle, type Locale } from './locale';

describe('chromeCopy', () => {
  it('returns Somali nav labels and English when the locale flips', () => {
    expect(chromeCopy('en').about).toBe('About ICE Institute');
    expect(chromeCopy('en').globalStage).toBe('ICE at Global Stage');
    expect(chromeCopy('en').languageToggle).toBe('Af-Soomaali');
    expect(chromeCopy('so').about).toBe('Ku saabsan Machadka ICE');
    expect(chromeCopy('so').research).toBe('Sheekooyinka Cilmi-baarista Machadka ICE');
    expect(chromeCopy('so').stories).toBe('Sheekooyin');
    expect(chromeCopy('so').climateImpact).toBe('Saamaynta Cimilada');
    expect(chromeCopy('so').globalStage).toBe('ICE ee Marxaladda Caalamiga');
    expect(chromeCopy('so').floods).toBe('Daadad');
    expect(chromeCopy('so').droughts).toBe('Abaaraha');
    expect(chromeCopy('so').heatWaves).toBe('Hirarka kulaylka');
    expect(chromeCopy('so').languageToggle).toBe('English');
    expect(chromeCopy('so').apply).toBe('Codso');
    expect(chromeCopy('so').noStories).toMatch(/sheekooyin/);
    expect(chromeCopy('so').storyMapLocation).toMatch(/Khariidadda/);
    expect(CHROME.en.platform).toContain('Somali Climate');
    const locales: Locale[] = ['en', 'so'];
    expect(locales).toHaveLength(2);
    expect(hazardTitle('floods', chromeCopy('so'))).toBe('Daadad');
    expect(hazardTitle('el-nino', chromeCopy('en'))).toBe('El Niño');
    expect(chromeCopy('en').relatedFloods).toBe('Related: Floods');
    expect(chromeCopy('en').seeAlsoDroughts).toBe('See also Droughts');
    expect(chromeCopy('en').exploreClimateImpact).toBe('Explore Climate Impact');
    expect(chromeCopy('so').relatedFloods).toMatch(/Daadad/);
    expect(chromeCopy('so').seeAlsoDroughts).toMatch(/Abaaraha/);
    expect(chromeCopy('so').exploreClimateImpact).toMatch(/Saamaynta Cimilada/);
  });
});
