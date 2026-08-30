import { describe, expect, it } from 'vitest';
import { climateImpactHub, climateImpactPages } from './climate-impact';

describe('Climate Impact pages', () => {
  it('covers floods, droughts, and heat waves in Somalia', () => {
    expect(climateImpactHub.title).toBe('Climate Impact');
    expect(climateImpactPages.map((page) => page.id)).toEqual(['floods', 'droughts', 'heat-waves']);
    expect(climateImpactPages.map((page) => page.title)).toEqual(['Floods', 'Droughts', 'Heat waves']);
    const text = climateImpactPages.map((page) => `${page.lede} ${page.paragraphs.join(' ')}`).join(' ');
    expect(text).toMatch(/Somalia/);
    expect(text).toMatch(/Shabelle|Juba/i);
    expect(text).toMatch(/pastoral/i);
    expect(text).toMatch(/heat/i);
  });
});
