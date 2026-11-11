import { useMemo } from 'react';
import {
  forecastRainUrl,
  observedRainUrl,
  readTowns,
  seasonFor,
  sortByDryness,
  type RainStatus,
  type SomaliSeason,
  type TownReading,
} from '../../application/drought-watch';
import { formatLocaleDate } from '../../application/locale';
import { placeName } from '../../content/watch-places';
import { BASELINE_PERIOD, DROUGHT_TOWNS } from '../../content/watch-baselines';
import { AutoplayScroll } from '../chrome/AutoplayScroll';
import { useLocale } from '../chrome/LocaleContext';
import { somaliaToday, useOpenMeteo } from '../useOpenMeteo';
import { STATUS_COLOR, StatusBadge, StatusLegend, type StatusTone } from './StatusBadge';
import { WatchMap } from './WatchMap';
import { WatchDisclaimer, WatchSources, WatchStatusMessage, type WatchSource } from './WatchSources';

const TONE: Record<RainStatus, StatusTone> = {
  wet: 'wet',
  normal: 'good',
  dry: 'warning',
  'very-dry': 'critical',
  'dry-season': 'neutral',
};

/** The bar runs from 0% to 200% of normal; the mark sits at 100%. */
const SCALE_MAX = 200;

const SOURCES: WatchSource[] = [
  {
    text: `Observed rainfall: ERA5 reanalysis, Copernicus Climate Change Service (C3S). Contains modified Copernicus Climate Change Service information ${new Date().getFullYear()}. Normals for ${BASELINE_PERIOD}.`,
    url: 'https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels',
  },
  {
    text: 'Accessed through the Open-Meteo Historical Weather and Forecast APIs (Open-Meteo.com), CC BY 4.0. Forecast from Open-Meteo best-match weather models. ERA5 records less rain than ground gauges in parts of Somalia, so each town is compared only with its own ERA5 normal.',
    url: 'https://open-meteo.com/en/docs/historical-weather-api',
  },
];

export function DroughtWatchPage() {
  const { copy, locale } = useLocale();
  const todayIso = somaliaToday();
  const observed = useOpenMeteo<unknown>(observedRainUrl(DROUGHT_TOWNS, todayIso));
  const forecast = useOpenMeteo<unknown>(forecastRainUrl(DROUGHT_TOWNS));

  const readings = useMemo(
    () =>
      observed.status === 'ready'
        ? sortByDryness(
            readTowns(
              observed.data as Parameters<typeof readTowns>[0],
              forecast.status === 'ready' ? (forecast.data as Parameters<typeof readTowns>[1]) : undefined,
              DROUGHT_TOWNS,
            ),
          )
        : [],
    [observed, forecast],
  );

  const label: Record<RainStatus, string> = {
    wet: copy.rainWet,
    normal: copy.rainNormal,
    dry: copy.rainDry,
    'very-dry': copy.rainVeryDry,
    'dry-season': copy.rainDrySeason,
  };
  const hint: Record<RainStatus, string> = {
    wet: copy.rainWetHint,
    normal: copy.rainNormalHint,
    dry: copy.rainDryHint,
    'very-dry': copy.rainVeryDryHint,
    'dry-season': copy.rainDrySeasonHint,
  };
  const seasonLabel: Record<SomaliSeason, string> = {
    gu: copy.seasonGu,
    hagaa: copy.seasonHagaa,
    deyr: copy.seasonDeyr,
    jilaal: copy.seasonJilaal,
  };
  const date = (iso: string) => formatLocaleDate(iso, locale);
  const name = (reading: TownReading) => placeName(reading.town.id, reading.town.name, locale);
  const asOf = readings.find((reading) => reading.asOf)?.asOf ?? null;
  const mm = (value: number | null) => (value === null ? '–' : `${value.toLocaleString('en')} ${copy.rainUnit}`);

  const row = (reading: TownReading) => {
    const status = reading.status;
    const fill = reading.percent === null ? 0 : Math.min(reading.percent, SCALE_MAX) / SCALE_MAX;
    return (
      <li className="rain-row" key={reading.town.id}>
        <div className="rain-row-head">
          <h3>{name(reading)}</h3>
          {status ? <StatusBadge tone={TONE[status]} label={label[status]} hint={hint[status]} /> : null}
        </div>
        {reading.percent !== null && status ? (
          <div className="rain-meter" aria-hidden="true">
            <span className="rain-meter-fill" style={{ width: `${fill * 100}%`, background: STATUS_COLOR[TONE[status]] }} />
            <span className="rain-meter-mark" style={{ insetInlineStart: '50%' }} />
          </div>
        ) : null}
        <p className="rain-figures">
          {reading.percent !== null ? (
            <strong>
              {reading.percent}
              {copy.rainOfNormal}
            </strong>
          ) : null}
          <span>
            {copy.rainLast90}: {mm(reading.observed)}
          </span>
          <span>
            {copy.rainNormal90}: {mm(reading.normal)}
          </span>
          <span>
            {copy.rainNext16}: {mm(reading.forecast)}
          </span>
        </p>
      </li>
    );
  };

  return (
    <article className="detail watch-page" aria-label={copy.droughtWatch}>
      <AutoplayScroll />
      <h1>{copy.droughtWatch}</h1>
      <p className="watch-intro">{copy.droughtWatchIntro}</p>
      <WatchDisclaimer />
      <p className="watch-season">
        <strong>{copy.seasonNow}:</strong> {seasonLabel[seasonFor(todayIso)]}
      </p>
      <StatusLegend
        items={(['very-dry', 'dry', 'normal', 'wet', 'dry-season'] as RainStatus[]).map((status) => ({
          tone: TONE[status],
          label: label[status],
          hint: hint[status],
        }))}
      />
      <WatchStatusMessage state={observed} />

      {readings.length ? (
        <>
          {asOf ? (
            <p className="watch-how">
              {copy.watchUpdated} {date(asOf)}
            </p>
          ) : null}
          <WatchMap
            label={copy.watchMap}
            points={readings.map((reading) => ({
              id: reading.town.id,
              name: name(reading),
              lat: reading.town.lat,
              lng: reading.town.lng,
              tone: reading.status ? TONE[reading.status] : 'neutral',
              detail: reading.status
                ? `${label[reading.status]}${reading.percent !== null ? ` · ${reading.percent}${copy.rainOfNormal}` : ''}`
                : '–',
            }))}
          />
          <ul className="rain-list">{readings.map(row)}</ul>
          <details className="watch-table">
            <summary>{copy.watchDataTable}</summary>
            <table>
              <thead>
                <tr>
                  <th scope="col">{copy.rainTown}</th>
                  <th scope="col">{copy.watchStatus}</th>
                  <th scope="col">{copy.rainLast90}</th>
                  <th scope="col">{copy.rainNormal90}</th>
                  <th scope="col">%</th>
                  <th scope="col">{copy.rainNext16}</th>
                </tr>
              </thead>
              <tbody>
                {readings.map((reading) => (
                  <tr key={reading.town.id}>
                    <th scope="row">{name(reading)}</th>
                    <td>{reading.status ? label[reading.status] : '–'}</td>
                    <td>{mm(reading.observed)}</td>
                    <td>{mm(reading.normal)}</td>
                    <td>{reading.percent ?? '–'}</td>
                    <td>{mm(reading.forecast)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </>
      ) : null}
      <WatchSources sources={SOURCES} />
    </article>
  );
}
