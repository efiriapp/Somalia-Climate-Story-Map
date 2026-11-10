import { describe, expect, it } from 'vitest';
import { formatRoute, parseRoute, type Route } from './route';

describe('parseRoute', () => {
  it('falls back to the Stories screen in the fallback locale for an empty hash', () => {
    expect(parseRoute('', 'so')).toEqual({ locale: 'so', screen: 'stories', storyId: null, hazard: null });
  });

  it('reads locale, screen and story id', () => {
    expect(parseRoute('#/ar/research/the-digital-smallholder')).toEqual({
      locale: 'ar',
      screen: 'research',
      storyId: 'the-digital-smallholder',
      hazard: null,
    });
  });

  it('reads a climate hazard and ignores unknown hazards', () => {
    expect(parseRoute('#/en/climate-impact/floods').hazard).toBe('floods');
    expect(parseRoute('#/en/climate-impact/volcano').hazard).toBeNull();
  });

  it('accepts a route without a locale prefix', () => {
    expect(parseRoute('#/about', 'so')).toMatchObject({ locale: 'so', screen: 'about' });
  });

  it('treats unknown screens as the default screen', () => {
    expect(parseRoute('#/en/nowhere/x')).toMatchObject({ screen: 'stories', storyId: null });
  });

  it('does not attach a story id to screens that have no stories', () => {
    expect(parseRoute('#/en/global-stage/abc').storyId).toBeNull();
  });
});

describe('formatRoute', () => {
  it('round-trips every kind of route', () => {
    const routes: Route[] = [
      { locale: 'en', screen: 'stories', storyId: null, hazard: null },
      { locale: 'so', screen: 'research', storyId: 'a b/c', hazard: null },
      { locale: 'ar', screen: 'climate-impact', storyId: null, hazard: 'el-nino' },
      { locale: 'en', screen: 'global-stage', storyId: null, hazard: null },
    ];
    for (const route of routes) {
      expect(parseRoute(formatRoute(route))).toEqual(route);
    }
  });

  it('drops details that do not belong to the screen', () => {
    expect(formatRoute({ locale: 'en', screen: 'about', storyId: 'x', hazard: 'floods' })).toBe('#/en/about');
  });
});
