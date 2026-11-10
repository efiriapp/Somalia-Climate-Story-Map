import { COMPARE_COLORS, type AdminLevel, type UnitArea } from '../../application/flood-history';
import { useLocale } from '../chrome/LocaleContext';
import galmudug from '../../assets/state-flags/galmudug.svg';
import hirshabelle from '../../assets/state-flags/hirshabelle.svg';
import jubaland from '../../assets/state-flags/jubaland.svg';
import southWest from '../../assets/state-flags/south-west.svg';

/** State flags from Wikimedia Commons (credits shown under the list). */
export const STATE_FLAGS: Record<string, string> = {
  galmudug,
  hirshabelle,
  jubaland,
  'south-west': southWest,
};

const FLAG_CREDIT =
  'Wikimedia Commons: Jubaland (Derkommander0916, CC BY-SA 4.0); Galmudug (Przemyslaw D. Gacia, CC BY-SA 3.0); South West (Himasaram) and Hirshabelle (Zabezt), public domain.';

type Props = {
  level: AdminLevel;
  onLevel: (level: AdminLevel) => void;
  rows: UnitArea[];
  /** What the figures cover, e.g. one flood's name or "16 floods". */
  subtitle: string;
  /** In compare mode: labels for the two floods (A in blue, B in orange). */
  compare?: { a: string; b: string };
  boundaryCredit: string;
  onClose: () => void;
};

/** Side panel: flooded hectares by state, region or district, with flags and bars. */
export function FloodStatePanel({ level, onLevel, rows, subtitle, compare, boundaryCredit, onClose }: Props) {
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
    <aside className="flood-state-side" aria-label={copy.stateArea}>
      <div className="flood-state-head">
        <h3>{copy.stateArea}</h3>
        <button type="button" onClick={onClose} aria-label={copy.mapClose}>
          ×
        </button>
      </div>
      <div className="flood-state-levels" role="tablist" aria-label={copy.stateArea}>
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
            <li key={row.id}>
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
                <span style={{ width: width(row.ha), background: COMPARE_COLORS.a }} />
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
            </li>
          ))}
        </ul>
      ) : (
        <p className="flood-state-sub">{copy.floodNone}</p>
      )}
      <p className="flood-state-note">{copy.stateAreaNote}</p>
      <p className="flood-state-credit">
        {copy.stateBoundaries}: {boundaryCredit}. {copy.stateFlags}: {FLAG_CREDIT}
      </p>
    </aside>
  );
}
