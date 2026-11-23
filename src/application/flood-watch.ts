import type { FloodStation } from '../content/watch-baselines';

/**
 * Flood Watch logic. River flow comes from the GloFAS model (via Open-Meteo)
 * and each station is compared with its own 1991–2020 daily record:
 * - high:     forecast flow reaches the 98th percentile (about 7 days a year)
 * - elevated: reaches the 90th percentile (about 5 weeks a year)
 * - normal:   below both
 * This is a modelled outlook, not an official warning.
 */
export type FlowStatus = 'normal' | 'elevated' | 'high';

export type FlowPoint = { date: string; value: number; forecast: boolean };

export type StationReading = {
  station: FloodStation;
  points: FlowPoint[];
  /** Latest value on or before today. */
  today: FlowPoint | null;
  /** Highest value from today through the next 7 days. */
  peak: FlowPoint | null;
  status: FlowStatus;
};

export const PAST_DAYS = 30;
export const FORECAST_DAYS = 16;
export const OUTLOOK_DAYS = 7;

export const flowStatus = (value: number, station: Pick<FloodStation, 'p90' | 'p98'>): FlowStatus =>
  value >= station.p98 ? 'high' : value >= station.p90 ? 'elevated' : 'normal';

export const floodForecastUrl = (stations: FloodStation[]): string => {
  const params = new URLSearchParams({
    latitude: stations.map((s) => s.cellLat).join(','),
    longitude: stations.map((s) => s.cellLng).join(','),
    daily: 'river_discharge',
    past_days: String(PAST_DAYS),
    forecast_days: String(FORECAST_DAYS),
  });
  return `https://flood-api.open-meteo.com/v1/flood?${params}`;
};

type DailyResponse = { daily?: { time?: string[]; river_discharge?: (number | null)[] } };

const addDays = (iso: string, days: number): string => {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

/** Turns the Open-Meteo response (one entry per station, same order) into readings. */
export const readStations = (
  response: DailyResponse | DailyResponse[],
  stations: FloodStation[],
  todayIso: string,
): StationReading[] => {
  const list = Array.isArray(response) ? response : [response];
  const outlookEnd = addDays(todayIso, OUTLOOK_DAYS);
  return stations.map((station, index) => {
    const daily = list[index]?.daily;
    const points: FlowPoint[] = (daily?.time ?? []).flatMap((date, i) => {
      const value = daily?.river_discharge?.[i];
      return typeof value === 'number' ? [{ date, value, forecast: date > todayIso }] : [];
    });
    const past = points.filter((point) => !point.forecast);
    const today = past.at(-1) ?? null;
    const outlook = points.filter((point) => point.date >= todayIso && point.date <= outlookEnd);
    const peak = outlook.reduce<FlowPoint | null>((best, point) => (!best || point.value > best.value ? point : best), null);
    return { station, points, today, peak, status: peak ? flowStatus(peak.value, station) : 'normal' };
  });
};

const ORDER: Record<FlowStatus, number> = { high: 0, elevated: 1, normal: 2 };

/** Most serious first, then upstream to downstream within a river. */
export const sortByConcern = (readings: StationReading[]): StationReading[] =>
  [...readings].sort((a, b) => ORDER[a.status] - ORDER[b.status]);

export const worstStatus = (readings: StationReading[]): FlowStatus =>
  sortByConcern(readings)[0]?.status ?? 'normal';
