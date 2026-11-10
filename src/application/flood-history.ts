import type { Locale } from './locale';

/**
 * Past flood maps prepared by scripts/prepare-watch-data.mjs into
 * public/data/watch (FAO SWALIM flood extents, 2013–2025).
 */
export type WatchSeason = 'gu' | 'deyr' | 'hagaa';

export type WatchLayerMeta = {
  id: string;
  file: string;
  group: 'flood-event' | 'flood-reference' | 'drought';
  title: string;
  features: number;
  sizeKB: number;
  season?: WatchSeason;
  year?: number;
  date?: string | null;
  river?: string;
  source?: string;
  sourceUrl?: string | null;
};

export type WatchManifest = { generated: string; layers: WatchLayerMeta[]; notes?: string[] };

export type FloodEvent = WatchLayerMeta & { season: WatchSeason; year: number };

const SEASON_ORDER: Record<WatchSeason, number> = { gu: 0, hagaa: 1, deyr: 2 };

const SEASON_SHORT: Record<Locale, Record<WatchSeason, string>> = {
  en: { gu: 'Gu', hagaa: 'Hagaa', deyr: 'Deyr' },
  so: { gu: 'Gu', hagaa: 'Xagaa', deyr: 'Dayr' },
  ar: { gu: 'غو', hagaa: 'حغا', deyr: 'دير' },
};

const RIVER_NAME: Record<Locale, Record<string, string>> = {
  en: { juba: 'Juba', shabelle: 'Shabelle' },
  so: { juba: 'Jubba', shabelle: 'Shabeelle' },
  ar: { juba: 'جوبا', shabelle: 'شبيلي' },
};

/** Flood events in time order (season within year, then exact date). */
export const floodEvents = (manifest: WatchManifest): FloodEvent[] =>
  manifest.layers
    .filter((layer): layer is FloodEvent => layer.group === 'flood-event' && !!layer.season && !!layer.year)
    .sort(
      (a, b) =>
        a.year - b.year ||
        SEASON_ORDER[a.season] - SEASON_ORDER[b.season] ||
        (a.date ?? '').localeCompare(b.date ?? ''),
    );

export const seasonShort = (season: WatchSeason, locale: Locale): string => SEASON_SHORT[locale][season];

/** e.g. "Gu 2024", "Deyr 2019 · Juba, 10 Nov", "Gu 2025 · Jowhar". */
export const floodEventLabel = (
  event: FloodEvent,
  locale: Locale,
  formatDate: (iso: string) => string,
): string => {
  const base = `${seasonShort(event.season, locale)} ${event.year}`;
  const parts: string[] = [];
  if (event.river === 'juba' || event.river === 'shabelle') parts.push(RIVER_NAME[locale][event.river]!);
  if (event.id.endsWith('-jowhar')) parts.push(locale === 'ar' ? 'جوهر' : 'Jowhar');
  if (event.date) parts.push(formatDate(event.date));
  if (event.id === 'flood-deyr-2023') parts.push(locale === 'ar' ? 'النينيو' : 'El Niño');
  return parts.length ? `${base} · ${parts.join(locale === 'ar' ? '، ' : ', ')}` : base;
};

/**
 * Sequential colour for "All floods": one hue, light (oldest) to dark
 * (newest), so year order reads at a glance.
 */
const RAMP = ['#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'];
export const yearColor = (year: number, first: number, last: number): string => {
  if (last <= first) return RAMP[RAMP.length - 1]!;
  const t = (year - first) / (last - first);
  return RAMP[Math.min(RAMP.length - 1, Math.round(t * (RAMP.length - 1)))]!;
};
export const YEAR_RAMP = RAMP;

/** Compare colours: categorical slots 1 and 2 (blue, orange), colour-blind safe. */
export const COMPARE_COLORS = { a: '#2a78d6', b: '#eb6834' } as const;

type AreaFeature = { properties?: { area_ha?: number; type?: string } | null };

export type FloodArea = { total: number; farmland: number | null; other: number | null };

/** Flooded hectares in a prepared layer, split by land type where the map has it. */
export const floodArea = (features: AreaFeature[]): FloodArea => {
  let total = 0;
  let farmland = 0;
  let other = 0;
  let typed = false;
  for (const feature of features) {
    const ha = feature.properties?.area_ha ?? 0;
    total += ha;
    const type = feature.properties?.type ?? '';
    if (/farmland/i.test(type)) {
      typed = true;
      farmland += ha;
    } else if (/non-agricultural/i.test(type)) {
      typed = true;
      other += ha;
    }
  }
  return { total, farmland: typed ? farmland : null, other: typed ? other : null };
};

/** Difference of B against A, as hectares and percent of A. */
export const compareAreas = (a: number, b: number): { diff: number; percent: number | null } => ({
  diff: b - a,
  percent: a > 0 ? Math.round(((b - a) / a) * 100) : null,
});

/** Months each Somali season covers: Gu April–June, Hagaa July–September, Deyr October–December. */
const SEASON_MONTHS: Record<WatchSeason, number[]> = { gu: [4, 5, 6], hagaa: [7, 8, 9], deyr: [10, 11, 12] };

/** Months (1–12) a flood map belongs to: its exact date's month, else its season's months. */
export const eventMonths = (event: Pick<FloodEvent, 'season' | 'date'>): number[] =>
  event.date ? [Number(event.date.slice(5, 7))] : SEASON_MONTHS[event.season];

export type DateFilter = { year: number | 'all'; month: number | 'all' };

export const matchesDate = (event: FloodEvent, filter: DateFilter): boolean =>
  (filter.year === 'all' || event.year === filter.year) &&
  (filter.month === 'all' || eventMonths(event).includes(filter.month));

/** Years that have flood maps, newest first. */
export const floodYears = (events: FloodEvent[]): number[] =>
  [...new Set(events.map((event) => event.year))].sort((a, b) => b - a);

/** Months that have flood maps, in calendar order, within a year or across all years. */
export const floodMonths = (events: FloodEvent[], year: number | 'all'): number[] =>
  [...new Set(events.filter((e) => year === 'all' || e.year === year).flatMap(eventMonths))].sort((a, b) => a - b);

/** Localised month name, e.g. "Nov", "نوفمبر". */
export const monthName = (month: number, locale: Locale): string =>
  new Intl.DateTimeFormat(locale === 'so' ? 'so' : locale === 'ar' ? 'ar' : 'en', { month: 'long', timeZone: 'UTC' }).format(
    new Date(Date.UTC(2024, month - 1, 1)),
  );
