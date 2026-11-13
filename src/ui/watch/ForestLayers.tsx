import type { ReactNode } from 'react';
import { CHARCOAL_COLORS, type CharcoalKind } from '../../application/charcoal';
import { FOREST_LAYERS, type ForestLayerId } from '../../application/forest-watch';
import type { AdminLevel } from '../../application/flood-history';
import { useLocale } from '../chrome/LocaleContext';
import { CharcoalGlyph } from '../map/charcoalIcon';

export type ForestLayerState = Record<ForestLayerId | CharcoalKind, boolean>;

export const CHARCOAL_KINDS: CharcoalKind[] = ['export', 'local', 'studied'];

/** True when any charcoal layer is on. */
export const charcoalOn = (on: ForestLayerState) => CHARCOAL_KINDS.some((kind) => on[kind]);

const Swatch = ({ color, dashed }: { color: string; dashed?: boolean }) => (
  <span
    className="legend-key"
    style={dashed ? { background: 'transparent', border: `2px dashed ${color}` } : { background: color }}
    aria-hidden="true"
  />
);

/** Name and colour key of every layer. */
function useLayers(years: string): Record<keyof ForestLayerState, { name: string; key: ReactNode }> {
  const { copy } = useLocale();
  const forest = (id: ForestLayerId) => <Swatch color={FOREST_LAYERS.find((l) => l.id === id)!.color} />;
  return {
    loss: { name: `${copy.forestLoss} ${years}`, key: forest('loss') },
    cover: { name: copy.forestCover, key: forest('cover') },
    gain: { name: copy.forestGain, key: forest('gain') },
    export: { name: copy.charcoalExport, key: <CharcoalGlyph color={CHARCOAL_COLORS.export} /> },
    local: { name: copy.charcoalLocal, key: <CharcoalGlyph color={CHARCOAL_COLORS.local} /> },
    studied: { name: copy.charcoalStudied, key: <Swatch color={CHARCOAL_COLORS.studied} dashed /> },
  };
}

/** Layer list for the map's layers button: forest layers, the three charcoal layers, boundaries. */
export function ForestLayerList({
  on,
  onToggle,
  years,
  boundary,
  onBoundary,
}: {
  on: ForestLayerState;
  onToggle: (id: keyof ForestLayerState) => void;
  years: string;
  boundary: AdminLevel | null;
  onBoundary: (level: AdminLevel | null) => void;
}) {
  const { copy } = useLocale();
  const layers = useLayers(years);
  const row = (id: keyof ForestLayerState) => (
    <label key={id}>
      <input type="checkbox" checked={on[id]} onChange={() => onToggle(id)} />
      {layers[id].key}
      {layers[id].name}
    </label>
  );
  return (
    <div className="forest-side">
      {(['loss', 'cover', 'gain'] as const).map(row)}
      <fieldset className="forest-group">
        <legend>{copy.charcoalLayer}</legend>
        {CHARCOAL_KINDS.map(row)}
      </fieldset>
      <label className="forest-boundary">
        <span>{copy.layerBoundaries}</span>
        <select value={boundary ?? ''} onChange={(event) => onBoundary((event.target.value || null) as AdminLevel | null)}>
          <option value="">{copy.boundaryNone}</option>
          <option value="state">{copy.layerStates}</option>
          <option value="region">{copy.layerRegions}</option>
          <option value="district">{copy.layerDistricts}</option>
        </select>
      </label>
    </div>
  );
}

/** Legend on the map: only the layers that are shown. */
export function ForestLegend({ on, years }: { on: ForestLayerState; years: string }) {
  const layers = useLayers(years);
  const shown = (Object.keys(layers) as (keyof ForestLayerState)[]).filter((id) => on[id]);
  if (!shown.length) return null;
  return (
    <ul className="forest-legend">
      {shown.map((id) => (
        <li key={id}>
          {layers[id].key}
          {layers[id].name}
        </li>
      ))}
    </ul>
  );
}
