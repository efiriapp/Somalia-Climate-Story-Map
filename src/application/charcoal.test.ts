import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { charcoalRanking, type CharcoalByAdmin } from './charcoal';

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

describe('prepared charcoal file', () => {
  it('lists an area record for every place', () => {
    const file = JSON.parse(readFileSync(join(process.cwd(), 'public/data/watch/charcoal-by-admin.json'), 'utf8'));
    expect(file.kinds).toEqual(['export', 'local', 'studied']);
    for (const level of ['state', 'region', 'district']) {
      for (const unit of file.levels[level].units) expect(file.levels[level].areas[unit.id]).toBeDefined();
    }
  });
});

describe('charcoalRanking', () => {
  it('ranks places by one kind of area, largest first, leaving out places without it', () => {
    expect(charcoalRanking(data, 'state', 'export')).toEqual([{ id: 'jubaland', name: 'Jubaland', ha: 70 }]);
    expect(charcoalRanking(data, 'state', 'local')).toEqual([{ id: 'puntland', name: 'Puntland', ha: 2000 }]);
  });
});

describe('charcoal areas on the map', () => {
  it('has each area with its kind, size and location (districts, region) for its popup', () => {
    const areas = JSON.parse(readFileSync(join(process.cwd(), 'public/data/watch/charcoal-areas.geojson'), 'utf8'));
    // SWALIM's layer: 4 export areas, 8 local consumption areas and the study area.
    const count = (kind: string) => areas.features.filter((f: { properties: { kind: string } }) => f.properties.kind === kind).length;
    expect([count('export'), count('local'), count('studied')]).toEqual([4, 8, 1]);
    for (const area of areas.features) {
      expect(area.properties.ha).toBeGreaterThan(0);
      expect(area.properties.districts.length).toBeGreaterThan(0);
      expect(area.properties.region).toBeTruthy();
    }
  });
});
