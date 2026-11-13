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

type ListProps = {
  rows: UnitArea[];
  level: AdminLevel;
  color: string;
  /** Second bar per place (e.g. flood B), in this colour. */
  pair?: { a: string; b: string };
  onPick?: (id: string) => void;
  selectedId?: string | null;
};

/** Places numbered 1, 2, 3... by size (both bars together), largest first, with flags and bars. */
function RankedList({ rows: unsorted, level, color, pair, onPick, selectedId }: ListProps) {
  const { copy } = useLocale();
  const rows = [...unsorted].sort((x, y) => y.ha + (y.b ?? 0) - (x.ha + (x.b ?? 0)));
  const max = Math.max(1, ...rows.map((row) => Math.max(row.ha, row.b ?? 0)));
  const area = (value: number) => `${formatKm2(value)} ${copy.km2}`;
  const width = (value: number) => `${value > 0 ? Math.max(1.5, (value / max) * 100) : 0}%`;
  if (!rows.length) return <p className="flood-state-sub">{copy.floodNone}</p>;

  return (
    <ol className="flood-state-list">
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
              {!pair ? <span className="flood-state-value">{area(row.ha)}</span> : null}
            </div>
            <div className="flood-state-bar" title={area(row.ha)}>
              <span style={{ width: width(row.ha), background: pair ? pair.a : color }} />
            </div>
            {pair ? (
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
  );
}

export type AreaSection = { title: string; color: string; rows: UnitArea[] };

type Props = {
  title: string;
  /** Bar colour (the map layer's colour); compare mode uses blue and orange. */
  color?: string;
  level: AdminLevel;
  onLevel: (level: AdminLevel) => void;
  /** One ranked list... */
  rows?: UnitArea[];
  /** ...or several, each with its own title, colour and ranking (e.g. export / local charcoal). */
  sections?: AreaSection[];
  /** What the figures cover, e.g. one flood's name or "16 floods". */
  subtitle: string;
  /** Two bars per place (e.g. flood A and B): their labels... */
  compare?: { a: string; b: string };
  /** ...and colours (blue and orange unless given). */
  compareColors?: { a: string; b: string };
  onClose?: () => void;
  /** When given, rows are buttons that choose a place. */
  onPick?: (id: string) => void;
  selectedId?: string | null;
  /** More content under the bars (e.g. a yearly chart). */
  children?: ReactNode;
};

/**
 * Side panel beside a map: area (km²) by state, region or district, with state
 * flags, ranks and bars (flooded area, forest loss, charcoal areas...).
 */
export function AreaPanel({
  title,
  color = COMPARE_COLORS.a,
  level,
  onLevel,
  rows = [],
  sections,
  subtitle,
  compare,
  compareColors = COMPARE_COLORS,
  onClose,
  onPick,
  selectedId,
  children,
}: Props) {
  const { copy } = useLocale();
  const area = (value: number) => `${formatKm2(value)} ${copy.km2}`;
  const sum = (list: UnitArea[]) => list.reduce((total, row) => total + row.ha, 0);
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
        {!compare && !sections && rows.length ? (
          <>
            {' · '}
            <strong>{area(sum(rows))}</strong>
          </>
        ) : null}
      </p>
      {compare ? (
        <p className="flood-state-keys">
          <span>
            <span className="swatch" style={{ background: compareColors.a }} aria-hidden="true" /> {compare.a}
          </span>
          <span>
            <span className="swatch" style={{ background: compareColors.b }} aria-hidden="true" /> {compare.b}
          </span>
        </p>
      ) : null}
      {sections ? (
        sections.map((section) => (
          <section key={section.title} className="area-section" aria-label={section.title}>
            <h4>
              <span className="swatch" style={{ background: section.color }} aria-hidden="true" />
              {section.title}
              <span className="area-section-total">{area(sum(section.rows))}</span>
            </h4>
            <RankedList rows={section.rows} level={level} color={section.color} onPick={onPick} selectedId={selectedId} />
          </section>
        ))
      ) : (
        <RankedList
          rows={rows}
          level={level}
          color={color}
          pair={compare ? compareColors : undefined}
          onPick={onPick}
          selectedId={selectedId}
        />
      )}
      {children}
    </aside>
  );
}
