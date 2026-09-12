import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'MapPane.tsx'), 'utf8');

describe('MapPane', () => {
  it('defaults to Streets Equal Earth and includes the layers icon toggle', () => {
    expect(source).toContain('EqualEarthBasemap');
    expect(source).toContain('MapBasemapControl');
    expect(source).toContain('DEFAULT_MAP_LAYER');
    expect(source).toContain("useState<MapLayerId>(DEFAULT_MAP_LAYER)");
    expect(source).toContain('basemap={basemap}');
  });

  it('pauses reading autoplay when the reader interacts with the map', () => {
    expect(source).toContain('useOptionalAutoplay');
    expect(source).toContain('pauseAutoplay');
    expect(source).toContain('onWheel={pauseAutoplay}');
  });
});
