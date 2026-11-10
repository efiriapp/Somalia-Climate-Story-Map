import type { ClimateHazardId } from '../content/climate-impact';
import type { Locale } from './locale';

export type Screen =
  | 'about'
  | 'research'
  | 'stories'
  | 'climate-impact'
  | 'flood-watch'
  | 'drought-watch'
  | 'global-stage';

/** Everything needed to rebuild a page from its address. */
export type Route = {
  locale: Locale;
  screen: Screen;
  /** Story id on the Research or Stories screens. */
  storyId: string | null;
  /** Hazard id on the Climate Impact screen. */
  hazard: ClimateHazardId | null;
};

export const LOCALES: readonly Locale[] = ['en', 'so', 'ar'];
export const SCREENS: readonly Screen[] = [
  'about',
  'research',
  'stories',
  'climate-impact',
  'flood-watch',
  'drought-watch',
  'global-stage',
];
const HAZARDS: readonly ClimateHazardId[] = ['floods', 'droughts', 'heat-waves', 'el-nino', 'la-nina'];

export const DEFAULT_SCREEN: Screen = 'stories';

const isLocale = (value: string | undefined): value is Locale =>
  value !== undefined && (LOCALES as readonly string[]).includes(value);
const isScreen = (value: string | undefined): value is Screen =>
  value !== undefined && (SCREENS as readonly string[]).includes(value);
const isHazard = (value: string | undefined): value is ClimateHazardId =>
  value !== undefined && (HAZARDS as readonly string[]).includes(value);

const safeDecode = (segment: string): string => {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
};

/**
 * Parses a hash such as `#/so/research/some-story-id` into a route.
 * Unknown or missing parts fall back to defaults so a bad link still opens the site.
 */
export const parseRoute = (hash: string, fallbackLocale: Locale = 'en'): Route => {
  const parts = hash
    .replace(/^#\/?/, '')
    .split('/')
    .filter(Boolean)
    .map(safeDecode);

  let index = 0;
  let locale = fallbackLocale;
  if (isLocale(parts[index])) {
    locale = parts[index] as Locale;
    index += 1;
  }

  const screenPart = parts[index];
  const screen: Screen = isScreen(screenPart) ? screenPart : DEFAULT_SCREEN;
  const detail = isScreen(screenPart) ? parts[index + 1] : undefined;

  return {
    locale,
    screen,
    storyId: (screen === 'research' || screen === 'stories') && detail ? detail : null,
    hazard: screen === 'climate-impact' && isHazard(detail) ? detail : null,
  };
};

/** Builds the hash for a route, e.g. `#/en/climate-impact/floods`. */
export const formatRoute = (route: Route): string => {
  const parts: string[] = [route.locale, route.screen];
  if ((route.screen === 'research' || route.screen === 'stories') && route.storyId) {
    parts.push(encodeURIComponent(route.storyId));
  }
  if (route.screen === 'climate-impact' && route.hazard) {
    parts.push(route.hazard);
  }
  return `#/${parts.join('/')}`;
};

export const LOCALE_STORAGE_KEY = 'ice-story-map:locale';

/** Last language the visitor picked, if the browser allows storage. */
export const readStoredLocale = (): Locale | null => {
  try {
    const value = globalThis.localStorage?.getItem(LOCALE_STORAGE_KEY) ?? undefined;
    return isLocale(value) ? value : null;
  } catch {
    return null;
  }
};

export const storeLocale = (locale: Locale): void => {
  try {
    globalThis.localStorage?.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Storage blocked (private mode, policy): the URL still carries the locale.
  }
};
