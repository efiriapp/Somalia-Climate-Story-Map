import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const dir = dirname(fileURLToPath(import.meta.url));
const workerSource = readFileSync(join(dir, 'maplibre-worker.ts'), 'utf8');
const mainSource = readFileSync(join(dir, '../main.tsx'), 'utf8');
const pkg = JSON.parse(readFileSync(join(dir, '../../package.json'), 'utf8'));

describe('maplibre-worker', () => {
  it('registers the MapLibre v6 worker so Global Stage raster maps can load', () => {
    expect(workerSource).toContain('setWorkerUrl');
    expect(workerSource).toContain('maplibre/maplibre-gl-worker.mjs');
    expect(mainSource).toContain('./application/maplibre-worker');
    expect(pkg.scripts.predev).toContain('copy-maplibre-worker');
    expect(pkg.scripts.prebuild).toContain('copy-maplibre-worker');
  });
});
