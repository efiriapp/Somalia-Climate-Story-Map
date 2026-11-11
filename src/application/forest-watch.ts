/**
 * Forest Watch map layers: Global Forest Watch (WRI) image tiles of the
 * University of Maryland forest change data. Free, no key, CC BY 4.0.
 */

const GFW_TILES = 'https://tiles.globalforestwatch.org';
const XYZ = '{z}/{x}/{y}.png';

/** Years of tree cover loss in GFW's dataset (umd_tree_cover_loss v1.13). */
export const LOSS_YEARS = { first: 2001, last: 2025 } as const;

const clampYear = (year: number) => Math.min(LOSS_YEARS.last, Math.max(LOSS_YEARS.first, year));

/** Loss tiles for a range of years (either order), at 30% canopy as on GFW. */
export const lossTileUrl = (from: number, to: number): string => {
  const [start, end] = [clampYear(Math.min(from, to)), clampYear(Math.max(from, to))];
  return (
    `${GFW_TILES}/umd_tree_cover_loss/v1.13/dynamic/${XYZ}` +
    `?start_year=${start}&end_year=${end}&tree_cover_density_threshold=30&render_type=true_color`
  );
};

export type ForestLayerId = 'loss' | 'cover' | 'gain';

export type ForestLayer = {
  id: ForestLayerId;
  /** Legend colour, as GFW draws the layer. */
  color: string;
  url: (from: number, to: number) => string;
  /** Source credit for the page's Sources list. */
  source: string;
  sourceUrl: string;
  licence: 'CC BY 4.0';
};

export const FOREST_LAYERS: ForestLayer[] = [
  {
    id: 'loss',
    color: '#dc6c9a',
    url: lossTileUrl,
    source:
      'Tree cover loss 2001–2025: Hansen, M. C., et al. (2013). High-resolution global maps of 21st-century forest cover change. Science, 342, 850–853. University of Maryland, via Global Forest Watch.',
    sourceUrl: 'https://data.globalforestwatch.org/datasets/gfw::tree-cover-loss',
    licence: 'CC BY 4.0',
  },
  {
    id: 'cover',
    color: '#97bd3d',
    url: () => `${GFW_TILES}/umd_tree_cover_density_2000/v1.8/tcd_30/${XYZ}`,
    source: 'Tree cover in 2000 (30% canopy): Hansen et al. (2013), University of Maryland, via Global Forest Watch.',
    sourceUrl: 'https://data.globalforestwatch.org/datasets/gfw::tree-cover-2000',
    licence: 'CC BY 4.0',
  },
  {
    id: 'gain',
    color: '#6d6de5',
    url: () => `${GFW_TILES}/umd_tree_cover_gain_from_height/v202206/dynamic/${XYZ}`,
    source:
      'Tree cover gain 2000–2020: Potapov, P., et al. (2022). The global 2000–2020 land cover and land use change dataset. Frontiers in Remote Sensing, 3. University of Maryland, via Global Forest Watch.',
    sourceUrl: 'https://data.globalforestwatch.org/datasets/gfw::tree-cover-gain-2000-2020',
    licence: 'CC BY 4.0',
  },
];

/** Yearly tree cover loss per place, from scripts/forest-loss.mjs. */
export type ForestLoss = {
  generated: string;
  method: string;
  firstYear: number;
  lastYear: number;
  /** Somalia, hectares per year. */
  total: number[];
  levels: Record<
    'state' | 'region' | 'district',
    { units: { id: string; name: string }[]; loss: Record<string, number[]> }
  >;
};

export type LossPoint = { year: number; ha: number };

/** Hectares lost each year in one place, or in all of Somalia when `unit` is null. */
export const lossSeries = (data: ForestLoss, level: keyof ForestLoss['levels'], unit: string | null): LossPoint[] => {
  const values = unit ? (data.levels[level].loss[unit] ?? []) : data.total;
  return values.map((ha, i) => ({ year: data.firstYear + i, ha }));
};

/** Places of one level with their total loss, most first. */
export const rankUnits = (data: ForestLoss, level: keyof ForestLoss['levels']) =>
  data.levels[level].units
    .map((unit) => ({ ...unit, ha: (data.levels[level].loss[unit.id] ?? []).reduce((sum, v) => sum + v, 0) }))
    .sort((a, b) => b.ha - a.ha);
