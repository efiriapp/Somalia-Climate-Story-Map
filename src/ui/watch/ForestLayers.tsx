import type { ReactNode } from 'react';
import { CHARCOAL_COLORS } from '../../application/charcoal';
import { FOREST_LAYERS, type ForestLayerId } from '../../application/forest-watch';
import type { AdminLevel } from '../../application/flood-history';
import { useLocale } from '../chrome/LocaleContext';
import { CharcoalGlyph } from '../map/charcoalIcon';

export type ForestLayerState = Record<ForestLayerId | 'charcoal', boolean>;

const Swatch = ({ color, dashed }: { color: string; dashed?: boolean }) => (
  <span
    className="legend-key"
    style={dashed ? { background: 'transparent', border: `2px dashed ${color}` } : { background: color }}
    aria-hidden="true"
  />
);

function useNames(years: string) {
  const { copy } = useLocale();
  return {
    loss: `${copy.forestLoss} ${years}`,
    cover: copy.forestCover,
    gain: copy.forestGain,
    charcoal: copy.charcoalLayer,
  } satisfies Record<keyof ForestLayerState, string>;
}

const keyFor = (id: ForestLayerId): ReactNode => <Swatch color={FOREST_LAYERS.find((l) => l.id === id)!.color} />;

/** Layer list for the map's layers button: tick the layers to show, choose boundaries. */
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
  const names = useNames(years);
  const rows: [keyof ForestLayerState, ReactNode][] = [
    ['loss', keyFor('loss')],
    ['cover', keyFor('cover')],
    ['gain', keyFor('gain')],
    ['charcoal', <CharcoalGlyph key="g" color={CHARCOAL_COLORS.export} />],
  ];
  return (
    <div className="forest-side">
      {rows.map(([id, key]) => (
        <label key={id}>
          <input type="checkbox" checked={on[id]} onChange={() => onToggle(id)} />
          {key}
          {names[id]}
        </label>
      ))}
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
  const { copy } = useLocale();
  const names = useNames(years);
  const items: [string, ReactNode, string][] = [
    ...(['loss', 'cover', 'gain'] as const).filter((id) => on[id]).map((id): [string, ReactNode, string] => [id, keyFor(id), names[id]]),
    ...(on.charcoal
      ? ([
          ['export', <CharcoalGlyph key="e" color={CHARCOAL_COLORS.export} />, copy.charcoalExport],
          ['local', <CharcoalGlyph key="l" color={CHARCOAL_COLORS.local} />, copy.charcoalLocal],
          ['studied', <Swatch key="s" color={CHARCOAL_COLORS.studied} dashed />, copy.charcoalStudied],
        ] as [string, ReactNode, string][])
      : []),
  ];
  if (!items.length) return null;
  return (
    <ul className="forest-legend">
      {items.map(([id, key, text]) => (
        <li key={id}>
          {key}
          {text}
        </li>
      ))}
    </ul>
  );
}
