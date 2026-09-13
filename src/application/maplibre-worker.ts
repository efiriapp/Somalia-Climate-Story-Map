import { setWorkerUrl } from 'maplibre-gl';

/**
 * MapLibre GL JS v6 parses vector tiles in a web worker.
 * Without a same-origin worker URL, MapLibre styles can load (white
 * background + attribution) but no tiles are requested.
 *
 * Worker + shared sibling are copied to /public/maplibre by
 * scripts/copy-maplibre-worker.mjs (see package.json predev/prebuild).
 */
setWorkerUrl(`${import.meta.env.BASE_URL}maplibre/maplibre-gl-worker.mjs`);
