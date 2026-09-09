import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'MapBasemapControl.tsx'), 'utf8');

describe('MapBasemapControl', () => {
  it('exposes a layers icon menu with Streets, Satellite, and Terrain', () => {
    expect(source).toContain('aria-label="Map layers"');
    expect(source).toContain('MAP_LAYERS');
    expect(source).toContain('tour-layer-menu');
    expect(source).toContain('menuitemradio');
  });
});
