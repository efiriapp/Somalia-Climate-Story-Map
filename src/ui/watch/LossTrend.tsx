import { FOREST_LAYERS, lossSeries, rankUnits, type ForestLoss } from '../../application/forest-watch';
import type { AdminLevel } from '../../application/flood-history';
import { useLocale } from '../chrome/LocaleContext';
import { LossChart } from './LossChart';

type Props = {
  data: ForestLoss;
  level: AdminLevel;
  /** Chosen state, region or district; null for all of Somalia. */
  place: string | null;
  onPlace: (place: string | null) => void;
};

/** Tree cover loss by year for Somalia or one state, region or district. */
export function LossTrend({ data, level, place, onPlace }: Props) {
  const { copy } = useLocale();
  const series = lossSeries(data, level, place);
  const name = place ? (data.levels[level].units.find((unit) => unit.id === place)?.name ?? '') : copy.forestSomalia;
  const total = series.reduce((sum, point) => sum + point.ha, 0);
  const ha = (value: number) => `${Math.round(value).toLocaleString('en')} ${copy.hectares}`;

  return (
    <section className="forest-trend" aria-label={copy.forestTrend}>
      <h2>{copy.forestTrend}</h2>
      <div className="forest-trend-controls">
        <label className="forest-place">
          <span>{copy.forestPlace}</span>
          <select value={place ?? ''} onChange={(event) => onPlace(event.target.value || null)}>
            <option value="">{copy.forestSomalia}</option>
            {rankUnits(data, level).map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name} · {ha(unit.ha)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="forest-trend-total">
        {name} · {copy.floodTotal} {data.firstYear}–{data.lastYear}: <strong>{ha(total)}</strong>
      </p>
      <LossChart
        points={series}
        color={FOREST_LAYERS[0]!.color}
        unit={copy.hectares}
        summary={`${copy.forestTrend}, ${name}, ${data.firstYear}–${data.lastYear}: ${ha(total)}`}
      />
      <details className="watch-table">
        <summary>{copy.watchDataTable}</summary>
        <table>
          <tbody>
            {series.map((point) => (
              <tr key={point.year}>
                <th scope="row">{point.year}</th>
                <td>{ha(point.ha)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}
