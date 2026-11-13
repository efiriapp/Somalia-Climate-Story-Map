import { FOREST_LAYERS, lossSeries, type ForestLoss } from '../../application/forest-watch';
import type { AdminLevel } from '../../application/flood-history';
import { useLocale } from '../chrome/LocaleContext';
import { formatKm2, haToKm2 } from '../../application/area';
import { LossChart } from './LossChart';

type Props = {
  data: ForestLoss;
  level: AdminLevel;
  /** Chosen state, region or district; null for all of Somalia. */
  place: string | null;
};

/** Tree cover loss by year, in the side panel under the bars: Somalia or the chosen place. */
export function LossTrend({ data, level, place }: Props) {
  const { copy } = useLocale();
  const series = lossSeries(data, level, place);
  const name = place ? (data.levels[level].units.find((unit) => unit.id === place)?.name ?? '') : copy.forestSomalia;
  const total = series.reduce((sum, point) => sum + point.ha, 0);
  const area = (value: number) => `${formatKm2(value)} ${copy.km2}`;

  return (
    <div className="forest-trend">
      <p className="forest-trend-total">
        <strong>{name}</strong> · {data.firstYear}–{data.lastYear}: <strong>{area(total)}</strong>
      </p>
      <LossChart
        points={series.map((point) => ({ year: point.year, value: haToKm2(point.ha) }))}
        color={FOREST_LAYERS[0]!.color}
        unit={copy.km2}
        summary={`${copy.forestTrend}, ${name}, ${data.firstYear}–${data.lastYear}: ${area(total)}`}
      />
      <details className="watch-table">
        <summary>{copy.watchDataTable}</summary>
        <table>
          <tbody>
            {series.map((point) => (
              <tr key={point.year}>
                <th scope="row">{point.year}</th>
                <td>{area(point.ha)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
