import type { DroughtTown } from '../content/watch-baselines';

/**
 * Drought Watch logic: rainfall in the last 90 days (ERA5, via Open-Meteo)
 * as a percentage of the 1991–2020 normal for the same 90 days of the year,
 * the "percent of normal precipitation" index used by drought monitors.
 * In the dry seasons (Jilaal, Hagaa) the normal is tiny and a percentage is
 * meaningless, so those towns are shown as "dry season" instead.
 */
export type RainStatus = 'dry-season' | 'wet' | 'normal' | 'dry' | 'very-dry';

/** Below this 90-day normal (mm), a percentage of normal is not meaningful. */
export const DRY_SEASON_NORMAL_MM = 15;

export const rainStatus = (observed: number, normal: number): RainStatus => {
  if (normal < DRY_SEASON_NORMAL_MM) return 'dry-season';
  const ratio = observed / normal;
  if (ratio >= 1.25) return 'wet';
  if (ratio >= 0.75) return 'normal';
  if (ratio >= 0.5) return 'dry';
  return 'very-dry';
};

/** Day-of-year slot 0..364 matching the baseline (29 February shares 28 February). */
export const dayIndex = (iso: string): number => {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  let index = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 86400000);
  const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  if (leap && index >= 59) index -= 1;
  return Math.min(index, 364);
};

export const addDays = (iso: string, days: number): string => {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

/** ERA5 reaches Open-Meteo about five days late; ask a little past that. */
export const OBSERVED_LAG_DAYS = 5;
export const WINDOW_DAYS = 90;
export const FORECAST_DAYS = 16;

export const observedRainUrl = (towns: DroughtTown[], todayIso: string): string => {
  const end = addDays(todayIso, -OBSERVED_LAG_DAYS);
  const params = new URLSearchParams({
    latitude: towns.map((t) => t.lat).join(','),
    longitude: towns.map((t) => t.lng).join(','),
    daily: 'precipitation_sum',
    start_date: addDays(end, -(WINDOW_DAYS + 10)),
    end_date: end,
    timezone: 'Africa/Mogadishu',
  });
  return `https://archive-api.open-meteo.com/v1/archive?${params}`;
};

export const forecastRainUrl = (towns: DroughtTown[]): string => {
  const params = new URLSearchParams({
    latitude: towns.map((t) => t.lat).join(','),
    longitude: towns.map((t) => t.lng).join(','),
    daily: 'precipitation_sum',
    forecast_days: String(FORECAST_DAYS),
    timezone: 'Africa/Mogadishu',
  });
  return `https://api.open-meteo.com/v1/forecast?${params}`;
};

type DailyRain = { daily?: { time?: string[]; precipitation_sum?: (number | null)[] } };

export type TownReading = {
  town: DroughtTown;
  /** Last day with observed data. */
  asOf: string | null;
  observed: number | null;
  normal: number | null;
  /** observed / normal, or null in the dry season or without data. */
  percent: number | null;
  status: RainStatus | null;
  forecast: number | null;
};

const asList = (response: DailyRain | DailyRain[] | undefined): DailyRain[] =>
  !response ? [] : Array.isArray(response) ? response : [response];

export const readTowns = (
  observed: DailyRain | DailyRain[],
  forecast: DailyRain | DailyRain[] | undefined,
  towns: DroughtTown[],
): TownReading[] => {
  const observedList = asList(observed);
  const forecastList = asList(forecast);
  return towns.map((town, index) => {
    const daily = observedList[index]?.daily;
    const days = (daily?.time ?? []).flatMap((date, i) => {
      const value = daily?.precipitation_sum?.[i];
      return typeof value === 'number' ? [{ date, value }] : [];
    });
    const window = days.slice(-WINDOW_DAYS);
    const asOf = window.at(-1)?.date ?? null;
    const complete = window.length === WINDOW_DAYS && asOf !== null;
    const total = complete ? Math.round(window.reduce((sum, day) => sum + day.value, 0)) : null;
    const normal = complete ? (town.normal90[dayIndex(asOf)] ?? null) : null;
    const status = total !== null && normal !== null ? rainStatus(total, normal) : null;
    const forecastValues = forecastList[index]?.daily?.precipitation_sum ?? [];
    const forecastTotal = forecastValues.length
      ? Math.round(forecastValues.reduce<number>((sum, v) => sum + (v ?? 0), 0))
      : null;
    return {
      town,
      asOf,
      observed: total,
      normal,
      percent: status && status !== 'dry-season' && normal ? Math.round((total! / normal) * 100) : null,
      status,
      forecast: forecastTotal,
    };
  });
};

const ORDER: Record<RainStatus, number> = { 'very-dry': 0, dry: 1, normal: 2, wet: 3, 'dry-season': 4 };

export const sortByDryness = (readings: TownReading[]): TownReading[] =>
  [...readings].sort(
    (a, b) =>
      (a.status ? ORDER[a.status] : 5) - (b.status ? ORDER[b.status] : 5) ||
      (a.percent ?? 999) - (b.percent ?? 999),
  );

/** Somalia's seasons, used to explain what "normal" means right now. */
export type SomaliSeason = 'jilaal' | 'gu' | 'hagaa' | 'deyr';

export const seasonFor = (iso: string): SomaliSeason => {
  const month = Number(iso.slice(5, 7));
  if (month >= 4 && month <= 6) return 'gu';
  if (month >= 7 && month <= 9) return 'hagaa';
  if (month >= 10 && month <= 12) return 'deyr';
  return 'jilaal';
};
