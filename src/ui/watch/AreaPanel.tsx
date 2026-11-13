import type { ReactNode } from 'react';
import { COMPARE_COLORS, type AdminLevel, type UnitArea } from '../../application/flood-history';
import { useLocale } from '../chrome/LocaleContext';
import { formatKm2 } from '../../application/area';
import { STATE_FLAGS } from './stateFlags';

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
  /** Two bars per place (e.g. flood A and B): their labels... */
  compare?: { a: string; b: string };
  /** ...and colours (blue and orange unless given). */
  compareColors?: { a: string; b: string };
  /** Optional switch between topics shown above the level tabs. */
  topics?: { id: string; label: string }[];
  topic?: string;
  onTopic?: (id: string) => void;
  onClose?: () => void;
  /** When given, rows are buttons that choose a place. */
  onPick?: (id: string) => void;
  selectedId?: string | null;
  /** More content under the bars (e.g. a yearly chart). */
  children?: ReactNode;
};

/**
 * Side panel beside a map: area (km²) by state, region or district, with state
 * flags and bars (flooded area, forest loss...).
 */
export function AreaPanel({
  title,
  color = COMPARE_COLORS.a,
  level,
  onLevel,
  rows: unsorted,
  subtitle,
  compare,
  compareColors = COMPARE_COLORS,
  topics,
  topic,
  onTopic,
  onClose,
  onPick,
  selectedId,
  children,
}: Props) {
  const { copy } = useLocale();
  const pair = compareColors;
  // Largest first (both bars together), numbered 1, 2, 3...
  const rows = [...unsorted].sort((x, y) => y.ha + (y.b ?? 0) - (x.ha + (x.b ?? 0)));
  const max = Math.max(1, ...rows.map((row) => Math.max(row.ha, row.b ?? 0)));
  const area = (value: number) => `${formatKm2(value)} ${copy.km2}`;
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
      {topics && onTopic ? (
        <div className="flood-state-levels area-topics" role="tablist" aria-label={title}>
          {topics.map((item) => (
            <button key={item.id} type="button" role="tab" aria-selected={topic === item.id} onClick={() => onTopic(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
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
            <strong>{area(total)}</strong>
          </>
        ) : null}
      </p>
      {compare ? (
        <p className="flood-state-keys">
          <span>
            <span className="swatch" style={{ background: pair.a }} aria-hidden="true" /> {compare.a}
          </span>
          <span>
            <span className="swatch" style={{ background: pair.b }} aria-hidden="true" /> {compare.b}
          </span>
        </p>
      ) : null}
      {rows.length ? (
        <ol className="flood-state-list" role="tabpanel">
          {rows.map((row, i) => (
            <li key={row.id} className={row.id === selectedId ? 'is-selected' : undefined}>
              <Row id={row.id} onPick={onPick} selected={row.id === selectedId}>
              <div className="flood-state-name">
                <span className="flood-state-rank" aria-hidden="true">
                  {i + 1}
                </span>
                {level === 'state' ? (
                  STATE_FLAGS[row.id] ? (
                    <img src={STATE_FLAGS[row.id]} alt="" width={30} height={20} loading="lazy" />
                  ) : (
                    <span className="flood-state-noflag" aria-hidden="true" />
                  )
                ) : null}
                <strong>{row.name}</strong>
                {!compare ? <span className="flood-state-value">{area(row.ha)}</span> : null}
              </div>
              <div className="flood-state-bar" title={area(row.ha)}>
                <span style={{ width: width(row.ha), background: compare ? pair.a : color }} />
              </div>
              {compare ? (
                <>
                  <span className="flood-state-value">{area(row.ha)}</span>
                  <div className="flood-state-bar" title={area(row.b ?? 0)}>
                    <span style={{ width: width(row.b ?? 0), background: pair.b }} />
                  </div>
                  <span className="flood-state-value">{area(row.b ?? 0)}</span>
                </>
              ) : null}
              </Row>
            </li>
          ))}
        </ol>
      ) : (
        <p className="flood-state-sub">{copy.floodNone}</p>
      )}
      {children}
    </aside>
  );
}
