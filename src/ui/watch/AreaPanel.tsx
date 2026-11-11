import type { ReactNode } from 'react';
import { COMPARE_COLORS, type AdminLevel, type UnitArea } from '../../application/flood-history';
import { useLocale } from '../chrome/LocaleContext';
import galmudug from '../../assets/state-flags/galmudug.svg';
import hirshabelle from '../../assets/state-flags/hirshabelle.svg';
import jubaland from '../../assets/state-flags/jubaland.svg';
import southWest from '../../assets/state-flags/south-west.svg';

/** State flags from Wikimedia Commons (credited in the page sources). */
export const STATE_FLAGS: Record<string, string> = {
  galmudug,
  hirshabelle,
  jubaland,
  'south-west': southWest,
};

/** A row: a button when places can be picked, otherwise plain content. */
function Row({
  id,
  onPick,
  selected,
  children,
}: {
  id: string;
  onPick?: (id: string) => void;
  selected: boolean;
  children: ReactNode;
}) {
  if (!onPick) return <>{children}</>;
  return (
    <button type="button" className="flood-state-pick" aria-pressed={selected} onClick={() => onPick(id)}>
      {children}
    </button>
  );
}

type Props = {
  title: string;
  /** Bar colour (the map layer's colour); compare mode uses blue and orange. */
  color?: string;
  level: AdminLevel;
  onLevel: (level: AdminLevel) => void;
  rows: UnitArea[];
  /** What the figures cover, e.g. one flood's name or "16 floods". */
  subtitle: string;
  /** In compare mode: labels for the two floods (A in blue, B in orange). */
  compare?: { a: string; b: string };
  onClose?: () => void;
  /** When given, rows are buttons that choose a place. */
  onPick?: (id: string) => void;
  selectedId?: string | null;
};

/**
 * Side panel beside a map: hectares by state, region or district, with state
 * flags and bars (flooded area, forest loss...).
 */
export function AreaPanel({
  title,
  color = COMPARE_COLORS.a,
  level,
  onLevel,
  rows,
  subtitle,
  compare,
  onClose,
  onPick,
  selectedId,
}: Props) {
  const { copy } = useLocale();
  const max = Math.max(1, ...rows.map((row) => Math.max(row.ha, row.b ?? 0)));
  const ha = (value: number) => `${Math.round(value).toLocaleString('en')} ${copy.hectares}`;
  const width = (value: number) => `${value > 0 ? Math.max(1.5, (value / max) * 100) : 0}%`;
  const total = rows.reduce((sum, row) => sum + row.ha, 0);
  const levels: [AdminLevel, string][] = [
    ['state', copy.adminState],
    ['region', copy.adminRegion],
    ['district', copy.adminDistrict],
  ];

  return (
    <aside className="flood-state-side" aria-label={title}>
      <div className="flood-state-head">
        <h3>{title}</h3>
        {onClose ? (
          <button type="button" onClick={onClose} aria-label={copy.mapClose}>
            ×
          </button>
        ) : null}
      </div>
      <div className="flood-state-levels" role="tablist" aria-label={title}>
        {levels.map(([id, text]) => (
          <button key={id} type="button" role="tab" aria-selected={level === id} onClick={() => onLevel(id)}>
            {text}
          </button>
        ))}
      </div>
      <p className="flood-state-sub">
        {subtitle}
        {!compare && rows.length ? (
          <>
            {' · '}
            <strong>{ha(total)}</strong>
          </>
        ) : null}
      </p>
      {compare ? (
        <p className="flood-state-keys">
          <span>
            <span className="swatch" style={{ background: COMPARE_COLORS.a }} aria-hidden="true" /> {compare.a}
          </span>
          <span>
            <span className="swatch" style={{ background: COMPARE_COLORS.b }} aria-hidden="true" /> {compare.b}
          </span>
        </p>
      ) : null}
      {rows.length ? (
        <ul className="flood-state-list" role="tabpanel">
          {rows.map((row) => (
            <li key={row.id} className={row.id === selectedId ? 'is-selected' : undefined}>
              <Row id={row.id} onPick={onPick} selected={row.id === selectedId}>
              <div className="flood-state-name">
                {level === 'state' ? (
                  STATE_FLAGS[row.id] ? (
                    <img src={STATE_FLAGS[row.id]} alt="" width={30} height={20} loading="lazy" />
                  ) : (
                    <span className="flood-state-noflag" aria-hidden="true" />
                  )
                ) : null}
                <strong>{row.name}</strong>
                {!compare ? <span className="flood-state-value">{ha(row.ha)}</span> : null}
              </div>
              <div className="flood-state-bar" title={ha(row.ha)}>
                <span style={{ width: width(row.ha), background: compare ? COMPARE_COLORS.a : color }} />
              </div>
              {compare ? (
                <>
                  <span className="flood-state-value">{ha(row.ha)}</span>
                  <div className="flood-state-bar" title={ha(row.b ?? 0)}>
                    <span style={{ width: width(row.b ?? 0), background: COMPARE_COLORS.b }} />
                  </div>
                  <span className="flood-state-value">{ha(row.b ?? 0)}</span>
                </>
              ) : null}
              </Row>
            </li>
          ))}
        </ul>
      ) : (
        <p className="flood-state-sub">{copy.floodNone}</p>
      )}
    </aside>
  );
}
