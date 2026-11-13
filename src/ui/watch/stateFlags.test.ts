import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { STATE_FLAG_SOURCES } from './stateFlags';

describe('state flags', () => {
  const states = JSON.parse(readFileSync(join(process.cwd(), 'public/data/watch/admin-states.geojson'), 'utf8'))
    .features.map((f: { properties: { id: string } }) => f.properties.id);

  it('has a flag file for every state on the map', () => {
    for (const id of states) {
      expect(existsSync(join(process.cwd(), `src/assets/state-flags/${id}.svg`)), id).toBe(true);
    }
  });

  it('credits every flag, with its licence', () => {
    expect(STATE_FLAG_SOURCES).toHaveLength(states.length);
    for (const source of STATE_FLAG_SOURCES) {
      expect(source.url).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      expect(source.text).toMatch(/public domain|CC0|CC BY-SA/);
    }
  });
});
