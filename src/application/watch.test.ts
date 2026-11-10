import { describe, expect, it } from 'vitest';
import type { DroughtTown, FloodStation } from '../content/watch-baselines';
import { DROUGHT_TOWNS, FLOOD_STATIONS } from '../content/watch-baselines';
import {
  addDays,
  dayIndex,
  observedRainUrl,
  rainStatus,
  readTowns,
  seasonFor,
  sortByDryness,
} from './drought-watch';
import { floodForecastUrl, flowStatus, readStations, sortByConcern } from './flood-watch';

const station: FloodStation = {
  id: 'test',
  river: 'shabelle',
  name: 'Test',
  lat: 4,
  lng: 45,
  cellLat: 4.025,
  cellLng: 45.025,
  median: 100,
  p90: 300,
  p98: 500,
  max: 900,
};

describe('flood watch', () => {
  it('rates flow against the station percentiles', () => {
    expect(flowStatus(299, station)).toBe('normal');
    expect(flowStatus(300, station)).toBe('elevated');
    expect(flowStatus(500, station)).toBe('high');
  });

  it('asks Open-Meteo for every station river cell in one call', () => {
    const url = new URL(floodForecastUrl([station, { ...station, cellLat: 1, cellLng: 2 }]));
    expect(url.searchParams.get('latitude')).toBe('4.025,1');
    expect(url.searchParams.get('past_days')).toBe('30');
    expect(url.searchParams.get('forecast_days')).toBe('16');
  });

  it('uses the highest flow in the next 7 days for status, not later forecast days', () => {
    const dates = Array.from({ length: 12 }, (_, i) => addDays('2026-11-08', i));
    const values = [50, 60, 70, 80, 90, 320, 100, 100, 100, 100, 600, 700];
    const [reading] = readStations({ daily: { time: dates, river_discharge: values } }, [station], '2026-11-10');
    expect(reading!.today).toEqual({ date: '2026-11-10', value: 70, forecast: false });
    expect(reading!.peak?.value).toBe(320);
    expect(reading!.status).toBe('elevated');
  });

  it('copes with missing values and lists the most serious stations first', () => {
    const readings = readStations(
      [
        { daily: { time: ['2026-11-10', '2026-11-11'], river_discharge: [null, 10] } },
        { daily: { time: ['2026-11-10', '2026-11-11'], river_discharge: [600, 700] } },
      ],
      [station, { ...station, id: 'b' }],
      '2026-11-10',
    );
    expect(readings[0]!.today).toBeNull();
    expect(sortByConcern(readings)[0]!.station.id).toBe('b');
  });
});

describe('drought watch', () => {
  it('rates 90-day rainfall as a percentage of normal', () => {
    expect(rainStatus(130, 100)).toBe('wet');
    expect(rainStatus(80, 100)).toBe('normal');
    expect(rainStatus(60, 100)).toBe('dry');
    expect(rainStatus(40, 100)).toBe('very-dry');
  });

  it('does not compute a percentage in the dry season, when little rain is normal', () => {
    expect(rainStatus(0, 8)).toBe('dry-season');
  });

  it('maps dates to the same day-of-year slot as the baseline', () => {
    expect(dayIndex('2025-01-01')).toBe(0);
    expect(dayIndex('2024-02-29')).toBe(58);
    expect(dayIndex('2024-03-01')).toBe(59);
    expect(dayIndex('2025-03-01')).toBe(59);
    expect(dayIndex('2024-12-31')).toBe(364);
  });

  it('names the Somali season', () => {
    expect(seasonFor('2026-05-01')).toBe('gu');
    expect(seasonFor('2026-11-10')).toBe('deyr');
    expect(seasonFor('2026-02-01')).toBe('jilaal');
    expect(seasonFor('2026-08-01')).toBe('hagaa');
  });

  it('asks for observed rain ending a few days back, since ERA5 arrives late', () => {
    const url = new URL(observedRainUrl([DROUGHT_TOWNS[0]!], '2026-11-10'));
    expect(url.searchParams.get('end_date')).toBe('2026-11-05');
  });

  it('sums the last 90 days and compares them with the normal for that day of year', () => {
    const town: DroughtTown = { id: 't', name: 'T', lat: 0, lng: 0, annual: 400, normal90: new Array(365).fill(200) };
    const time = Array.from({ length: 95 }, (_, i) => addDays('2026-08-01', i));
    const precipitation = time.map(() => 1);
    const [reading] = readTowns({ daily: { time, precipitation_sum: precipitation } }, { daily: { precipitation_sum: [2, 3] } }, [town]);
    expect(reading).toMatchObject({ observed: 90, normal: 200, percent: 45, status: 'very-dry', forecast: 5 });
    expect(reading!.asOf).toBe(time.at(-1));
  });

  it('leaves a town unrated when the 90-day window is incomplete', () => {
    const town: DroughtTown = { id: 't', name: 'T', lat: 0, lng: 0, annual: 400, normal90: new Array(365).fill(200) };
    const [reading] = readTowns({ daily: { time: ['2026-11-01'], precipitation_sum: [3] } }, undefined, [town]);
    expect(reading!.status).toBeNull();
    expect(sortByDryness([reading!])).toHaveLength(1);
  });
});

describe('watch baselines', () => {
  it('has a river cell and ordered thresholds for every station', () => {
    expect(FLOOD_STATIONS).toHaveLength(7);
    for (const s of FLOOD_STATIONS) {
      expect(s.median, s.id).toBeGreaterThan(0);
      expect(s.p90, s.id).toBeGreaterThan(s.median);
      expect(s.p98, s.id).toBeGreaterThan(s.p90);
    }
  });

  it('has a 365-day rainfall normal for every town', () => {
    expect(DROUGHT_TOWNS).toHaveLength(11);
    for (const town of DROUGHT_TOWNS) {
      expect(town.normal90, town.id).toHaveLength(365);
      expect(town.annual, town.id).toBeGreaterThan(0);
    }
  });
});
