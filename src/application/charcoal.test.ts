import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { charcoalByUnit, type CharcoalByAdmin } from './charcoal';

const data: CharcoalByAdmin = {
  generated: '',
  method: '',
  kinds: ['export', 'local', 'studied'],
  levels: {
    state: {
      units: [
        { id: 'jubaland', name: 'Jubaland' },
        { id: 'puntland', name: 'Puntland' },
        { id: 'banadir', name: 'Banadir' },
      ],
      areas: {
        jubaland: { export: 70, local: 0, studied: 3500 },
        puntland: { export: 0, local: 2000, studied: 0 },
        banadir: { export: 0, local: 0, studied: 10 },
      },
    },
    region: { units: [], areas: {} },
    district: { units: [], areas: {} },
  },
};

describe('charcoalByUnit', () => {
  it('gives export (ha) and local (b) per place, most charcoal area first', () => {
    expect(charcoalByUnit(data, 'state')).toEqual([
      { id: 'puntland', name: 'Puntland', ha: 0, b: 2000 },
      { id: 'jubaland', name: 'Jubaland', ha: 70, b: 0 },
    ]);
  });

  it('leaves out places with only the studied area', () => {
    expect(charcoalByUnit(data, 'state').map((row) => row.id)).not.toContain('banadir');
  });

  it('matches the prepared file', () => {
    const file = JSON.parse(readFileSync(join(process.cwd(), 'public/data/watch/charcoal-by-admin.json'), 'utf8'));
    expect(file.kinds).toEqual(['export', 'local', 'studied']);
    for (const level of ['state', 'region', 'district']) {
      for (const unit of file.levels[level].units) expect(file.levels[level].areas[unit.id]).toBeDefined();
    }
  });
});

describe('charcoal sites (map markers)', () => {
  it('has one point inside each export or local area, with its size', () => {
    const sites = JSON.parse(readFileSync(join(process.cwd(), 'public/data/watch/charcoal-sites.geojson'), 'utf8'));
    // SWALIM's layer: 4 export and 8 local areas (the study area has no marker).
    expect(sites.features).toHaveLength(12);
    for (const site of sites.features) {
      expect(site.geometry.type).toBe('Point');
      expect(['export', 'local']).toContain(site.properties.kind);
      expect(site.properties.ha).toBeGreaterThan(0);
    }
  });
});
