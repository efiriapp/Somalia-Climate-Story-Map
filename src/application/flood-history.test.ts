import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { htaccess } from '../../deploy/headers.mjs';
import {
  COMPARE_COLORS,
  areaByUnit,
  YEAR_RAMP,
  compareAreas,
  floodArea,
  floodEventLabel,
  floodEvents,
  yearColor,
  eventMonths,
  matchesDate,
  floodYears,
  floodMonths,
  monthName,
  periodKey,
  periodLabel,
  floodPeriods,
  type WatchManifest,
} from './flood-history';

const manifest = JSON.parse(
  readFileSync(join(__dirname, '../../public/data/watch/index.json'), 'utf8'),
) as WatchManifest;
const fmt = (iso: string) => iso;

describe('prepared flood data', () => {
  it('lists the 16 flood events from 2013 to 2025 in time order', () => {
    const events = floodEvents(manifest);
    expect(events).toHaveLength(16);
    expect(events[0]!.id).toBe('flood-deyr-2013');
    expect(events.at(-1)!.id).toBe('flood-gu-2025-jowhar');
    for (let i = 1; i < events.length; i++) {
      expect(events[i]!.year).toBeGreaterThanOrEqual(events[i - 1]!.year);
    }
  });

  it('has a file for every listed layer, plus rivers and gauging stations', () => {
    for (const layer of manifest.layers) {
      expect(() => readFileSync(join(__dirname, '../../public/data/watch', layer.file)), layer.file).not.toThrow();
    }
    const ids = manifest.layers.map((layer) => layer.id);
    expect(ids).toContain('rivers');
    expect(ids).toContain('river-gauging-stations');
  });
});

describe('flood labels', () => {
  const events = floodEvents(manifest);
  const byId = (id: string) => events.find((event) => event.id === id)!;

  it('names season, year and, where known, river, place and date', () => {
    expect(floodEventLabel(byId('flood-gu-2024'), 'en', fmt)).toBe('Gu 2024');
    expect(floodEventLabel(byId('flood-juba-2019-11-10'), 'en', fmt)).toBe('Deyr 2019 · Juba, 2019-11-10');
    expect(floodEventLabel(byId('flood-gu-2025-jowhar'), 'en', fmt)).toBe('Gu 2025 · Shabelle, Jowhar');
    expect(floodEventLabel(byId('flood-deyr-2023'), 'en', fmt)).toBe('Deyr 2023 · El Niño');
  });

  it('uses Somali and Arabic season names', () => {
    expect(floodEventLabel(byId('flood-deyr-2019'), 'so', fmt)).toBe('Dayr 2019');
    expect(floodEventLabel(byId('flood-gu-2024'), 'ar', fmt)).toBe('غو 2024');
  });
});

describe('flood map colours and areas', () => {
  it('shades All floods from light (oldest) to dark (newest)', () => {
    expect(yearColor(2013, 2013, 2025)).toBe(YEAR_RAMP[0]);
    expect(yearColor(2025, 2013, 2025)).toBe(YEAR_RAMP.at(-1));
  });

  it('uses two distinct colours to compare floods', () => {
    expect(COMPARE_COLORS.a).not.toBe(COMPARE_COLORS.b);
  });

  it('adds up flooded hectares and splits farmland where the map has it', () => {
    expect(
      floodArea([
        { properties: { area_ha: 100, type: 'Flooded farmland' } },
        { properties: { area_ha: 40, type: 'Flooded non-agricultural land' } },
      ]),
    ).toEqual({ total: 140, farmland: 100, other: 40 });
    expect(floodArea([{ properties: { area_ha: 75, type: 'Flooded area' } }])).toEqual({ total: 75, farmland: null, other: null });
  });

  it('reports the difference between two floods', () => {
    expect(compareAreas(100, 150)).toEqual({ diff: 50, percent: 50 });
    expect(compareAreas(0, 10)).toEqual({ diff: 10, percent: null });
  });
});

describe('serving the map data', () => {
  it('sends .geojson with the right type, compressed and cached for a day', () => {
    const config = htaccess();
    expect(config).toContain('AddType application/geo+json .geojson');
    expect(config).toMatch(/DEFLATE[^\n]*application\/geo\+json/);
    expect(config).toContain('<FilesMatch "\\.geojson$">');
  });
});

describe('flood dates', () => {
  const events = floodEvents(manifest);
  const byId = (id: string) => events.find((event) => event.id === id)!;

  it('places seasonal floods in their season months and dated ones in their own month', () => {
    expect(eventMonths(byId('flood-gu-2024'))).toEqual([4, 5, 6]);
    expect(eventMonths(byId('flood-deyr-2023'))).toEqual([10, 11, 12]);
    expect(eventMonths(byId('flood-juba-2019-11-10'))).toEqual([11]);
    expect(eventMonths(byId('flood-hagaa-2020'))).toEqual([9]);
  });

  it('filters by year and month', () => {
    const in2019 = events.filter((e) => matchesDate(e, { year: 2019, month: 'all' })).map((e) => e.id);
    expect(in2019).toEqual(['flood-gu-2019', 'flood-deyr-2019', 'flood-shabelle-2019-10-30', 'flood-juba-2019-11-10']);
    const nov2019 = events.filter((e) => matchesDate(e, { year: 2019, month: 11 })).map((e) => e.id);
    expect(nov2019).toEqual(['flood-deyr-2019', 'flood-juba-2019-11-10']);
  });

  it('lists only years and months that have flood maps', () => {
    expect(floodYears(events)).toEqual([2025, 2024, 2023, 2021, 2020, 2019, 2018, 2016, 2015, 2013]);
    expect(floodMonths(events, 2024)).toEqual([4, 5, 6]);
    expect(floodMonths(events, 2020)).toEqual([4, 5, 6, 9]);
    expect(floodMonths(events, 'all')).not.toContain(1);
  });

  it('names months in each language', () => {
    expect(monthName(11, 'en')).toBe('November');
    expect(monthName(11, 'ar')).toBe('نوفمبر');
  });
});

describe('date dropdown', () => {
  const events = floodEvents(manifest);
  const byId = (id: string) => events.find((event) => event.id === id)!;

  it('labels periods with dates only', () => {
    expect(periodLabel(byId('flood-gu-2024'), 'en')).toBe('Apr–Jun 2024');
    expect(periodLabel(byId('flood-deyr-2023'), 'en')).toBe('Oct–Dec 2023');
    expect(periodLabel(byId('flood-juba-2019-11-10'), 'en')).toBe('10 Nov 2019');
  });

  it('lists each available period once, newest first', () => {
    const periods = floodPeriods(events).map(periodKey);
    expect(periods[0]).toBe('2025-gu');
    expect(periods.at(-1)).toBe('2013-deyr');
    expect(new Set(periods).size).toBe(periods.length);
    expect(periods).toHaveLength(16);
  });
});

describe('areaByUnit', () => {
  const level = (units: { id: string; name: string }[], areas: Record<string, Record<string, number>>) => ({ units, areas });
  const states = [
    { id: 'jubaland', name: 'Jubaland' },
    { id: 'hirshabelle', name: 'Hirshabelle' },
    { id: 'galmudug', name: 'Galmudug' },
  ];
  const data = {
    generated: '2026-11-10',
    credit: 'b',
    method: 'm',
    totals: {},
    levels: {
      state: level(states, { one: { jubaland: 10, hirshabelle: 30 }, two: { jubaland: 25 } }),
      region: level([], {}),
      district: level([], {}),
    },
  };

  it('sums the chosen floods per unit, largest first, without empty units', () => {
    expect(areaByUnit(data, 'state', ['one', 'two'])).toEqual([
      { id: 'jubaland', name: 'Jubaland', ha: 35 },
      { id: 'hirshabelle', name: 'Hirshabelle', ha: 30 },
    ]);
  });

  it('carries the second flood for compare and keeps units flooded in either', () => {
    expect(areaByUnit(data, 'state', ['two'], 'one')).toEqual([
      { id: 'hirshabelle', name: 'Hirshabelle', ha: 0, b: 30 },
      { id: 'jubaland', name: 'Jubaland', ha: 25, b: 10 },
    ]);
  });

  it('matches the prepared files: every flood measured, states add up, flags exist', () => {
    const read = (f: string) => JSON.parse(readFileSync(join(process.cwd(), 'public/data/watch', f), 'utf8'));
    const file = read('flood-by-admin.json');
    const floods = read('index.json')
      .layers.filter((l: { group: string }) => l.group === 'flood-event')
      .map((l: { id: string; file: string }) => l);
    for (const level of ['state', 'region', 'district']) {
      expect(Object.keys(file.levels[level].areas).sort()).toEqual(floods.map((l: { id: string }) => l.id).sort());
    }
    for (const flood of floods) {
      const total = Object.values(file.totals[flood.id] as Record<string, number>).reduce((s, v) => s + v, 0);
      const inStates = Object.values(file.levels.state.areas[flood.id] as Record<string, number>).reduce((s, v) => s + v, 0);
      // A little of some floods lies outside Somalia (upper Juba); never more than 5%.
      expect(inStates).toBeLessThanOrEqual(total + 1);
      expect(inStates).toBeGreaterThan(total * 0.95);
      // The map layer carries the same full-detail total.
      const layerTotal = read(flood.file).features.reduce((s: number, f: { properties: { area_ha: number } }) => s + f.properties.area_ha, 0);
      expect(layerTotal).toBe(total);
    }
    for (const state of file.levels.state.units) {
      expect(existsSync(join(process.cwd(), `src/assets/state-flags/${state.id}.svg`))).toBe(true);
    }
  });
});
