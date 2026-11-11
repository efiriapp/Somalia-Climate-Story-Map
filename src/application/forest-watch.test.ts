import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CONTENT_SECURITY_POLICY } from '../../deploy/headers.mjs';
import { FOREST_LAYERS, LOSS_YEARS, lossSeries, lossTileUrl, rankUnits } from './forest-watch';

describe('tree cover loss tiles (Global Forest Watch)', () => {
  it('asks GFW for loss between two years at 30% canopy', () => {
    expect(lossTileUrl(2001, 2025)).toBe(
      'https://tiles.globalforestwatch.org/umd_tree_cover_loss/v1.13/dynamic/{z}/{x}/{y}.png' +
        '?start_year=2001&end_year=2025&tree_cover_density_threshold=30&render_type=true_color',
    );
  });

  it('accepts the years in either order', () => {
    expect(lossTileUrl(2020, 2010)).toBe(lossTileUrl(2010, 2020));
  });

  it('keeps years inside the data (GFW refuses years it has no data for)', () => {
    expect(lossTileUrl(1990, 2030)).toBe(lossTileUrl(LOSS_YEARS.first, LOSS_YEARS.last));
    expect(LOSS_YEARS).toEqual({ first: 2001, last: 2025 });
  });
});

describe('forest layers', () => {
  it('has tree cover 2000, loss and gain, all from GFW tiles with a CC BY 4.0 source', () => {
    expect(FOREST_LAYERS.map((layer) => layer.id)).toEqual(['loss', 'cover', 'gain']);
    for (const layer of FOREST_LAYERS) {
      expect(new URL(layer.url(2001, 2025).replace(/\{[xyz]\}/g, '0')).host).toBe('tiles.globalforestwatch.org');
      expect(layer.licence).toBe('CC BY 4.0');
    }
  });

  it('is allowed by the live site security policy', () => {
    const img = CONTENT_SECURITY_POLICY.split('; ').find((rule) => rule.startsWith('img-src'))!;
    expect(img).toContain('https://tiles.globalforestwatch.org');
  });
});

describe('loss trend data', () => {
  const data = {
    generated: '2026-11-11',
    method: 'm',
    firstYear: 2001,
    lastYear: 2003,
    total: [5, 7, 9],
    levels: {
      state: {
        units: [
          { id: 'jubaland', name: 'Jubaland' },
          { id: 'south-west', name: 'South West' },
        ],
        loss: { jubaland: [1, 2, 3], 'south-west': [4, 5, 6] },
      },
      region: { units: [], loss: {} },
      district: { units: [], loss: {} },
    },
  };

  it('gives yearly loss for one place, or for all of Somalia', () => {
    expect(lossSeries(data, 'state', 'jubaland')).toEqual([
      { year: 2001, ha: 1 },
      { year: 2002, ha: 2 },
      { year: 2003, ha: 3 },
    ]);
    expect(lossSeries(data, 'state', null).map((point) => point.ha)).toEqual([5, 7, 9]);
  });

  it('lists places with the most loss first', () => {
    expect(rankUnits(data, 'state')).toEqual([
      { id: 'south-west', name: 'South West', ha: 15 },
      { id: 'jubaland', name: 'Jubaland', ha: 6 },
    ]);
  });
});

describe('prepared forest loss file', () => {
  const read = (file: string) => JSON.parse(readFileSync(join(process.cwd(), 'public/data/watch', file), 'utf8'));
  const data = read('forest-loss.json');
  const years = data.lastYear - data.firstYear + 1;
  const sum = (values: number[]) => values.reduce((s, v) => s + v, 0);

  it('covers every year the map shows, inside Somalia only', () => {
    expect([data.firstYear, data.lastYear]).toEqual([LOSS_YEARS.first, LOSS_YEARS.last]);
    expect(data.total).toHaveLength(years);
    // Somalia's total is the sum of its districts.
    const districts = Object.values(data.levels.district.loss) as number[][];
    expect(sum(data.total)).toBeCloseTo(sum(districts.flat()), -1);
  });

  it('names only places that are on the boundary layers', () => {
    for (const [level, file] of [
      ['state', 'admin-states.geojson'],
      ['region', 'admin-regions.geojson'],
      ['district', 'admin-districts.geojson'],
    ]) {
      const ids = new Set(read(file).features.map((f: { properties: { id: string } }) => f.properties.id));
      for (const unit of data.levels[level].units) {
        expect(ids.has(unit.id), `${level} ${unit.id}`).toBe(true);
        expect(data.levels[level].loss[unit.id]).toHaveLength(years);
      }
    }
  });
});
