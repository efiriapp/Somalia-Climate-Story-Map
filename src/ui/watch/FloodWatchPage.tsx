import { useMemo, useState } from 'react';
import {
  floodForecastUrl,
  readStations,
  type FlowStatus,
  type StationReading,
} from '../../application/flood-watch';
import { formatLocaleDate } from '../../application/locale';
import { placeName } from '../../content/watch-places';
import { BASELINE_PERIOD, FLOOD_STATIONS, type RiverId } from '../../content/watch-baselines';
import { AutoplayScroll } from '../chrome/AutoplayScroll';
import { useLocale } from '../chrome/LocaleContext';
import { somaliaToday, useOpenMeteo } from '../useOpenMeteo';
import { FlowChart } from './FlowChart';
import { StatusBadge, StatusIcon, StatusLegend, type StatusTone } from './StatusBadge';
import { WatchMap } from './WatchMap';
import { FloodHistoryMap } from './FloodHistoryMap';
import { WatchDisclaimer, WatchSources, WatchStatusMessage, type WatchSource } from './WatchSources';

const TONE: Record<FlowStatus, StatusTone> = { normal: 'good', elevated: 'warning', high: 'critical' };

const SOURCES: WatchSource[] = [
  {
    text: 'Administrative boundaries (states, regions, districts): UNOCHA Somalia, via FAO SWALIM. Flooded areas measured on the full-detail SWALIM flood maps in an equal-area projection; a little of some floods lies outside Somalia.',
    url: 'https://spatial.faoswalim.org/',
  },
  {
    text: 'Flag of Jubaland, by Derkommander0916, Wikimedia Commons, CC BY-SA 4.0.',
    url: 'https://commons.wikimedia.org/wiki/File:Flag_of_Jubaland_(Somalia).svg',
  },
  {
    text: 'Flag of Galmudug, by Przemyslaw D. Gacia, Wikimedia Commons, CC BY-SA 3.0.',
    url: 'https://commons.wikimedia.org/wiki/File:Flag_of_Galmudug_State_of_Somalia_(2015).svg',
  },
  {
    text: 'Flags of South West State (Himasaram) and Hirshabelle (Zabezt), Wikimedia Commons, public domain.',
    url: 'https://commons.wikimedia.org/wiki/File:Flag_of_South_West_State_of_Somalia.svg',
  },
  {
    text: `River discharge: Global Flood Awareness System (GloFAS) v4, Copernicus Emergency Management Service. Contains modified Copernicus Emergency Management Service information ${new Date().getFullYear()}. Thresholds from the GloFAS reanalysis, ${BASELINE_PERIOD}.`,
    url: 'https://global-flood.emergency.copernicus.eu/',
  },
  {
    text: 'Accessed through the Open-Meteo Flood API (Open-Meteo.com), CC BY 4.0. Values are modelled, not river gauge readings.',
    url: 'https://open-meteo.com/en/docs/flood-api',
  },
  {
    text: 'Past floods map: flood extents, rivers and gauging stations from FAO SWALIM (Somalia Water and Land Information Management), 2013–2025, prepared by ICE Institute for the web (reprojected and simplified).',
    url: 'https://spatial.faoswalim.org/',
  },
];

const formatFlow = (value: number) => Math.round(value).toLocaleString('en');

export function FloodWatchPage() {
  const { copy, locale } = useLocale();
  const todayIso = somaliaToday();
  const state = useOpenMeteo<unknown>(floodForecastUrl(FLOOD_STATIONS));

  const readings = useMemo(
    () =>
      state.status === 'ready'
        ? readStations(state.data as Parameters<typeof readStations>[0], FLOOD_STATIONS, todayIso)
        : [],
    [state, todayIso],
  );

  const statusLabel: Record<FlowStatus, string> = {
    normal: copy.flowNormal,
    elevated: copy.flowElevated,
    high: copy.flowHigh,
  };
  const statusHint: Record<FlowStatus, string> = {
    normal: copy.flowNormalHint,
    elevated: copy.flowElevatedHint,
    high: copy.flowHighHint,
  };
  const riverLabel: Record<RiverId, string> = { shabelle: copy.riverShabelle, juba: copy.riverJuba };
  // Map filter: all rivers or one; all towns of it or one town.
  const [river, setRiver] = useState<RiverId | 'all'>('all');
  const [stationId, setStationId] = useState<string | null>(null);
  const riverReadings = readings.filter((reading) => river === 'all' || reading.station.river === river);
  const chosen = riverReadings.find((reading) => reading.station.id === stationId);
  const onMap = chosen ? [chosen] : riverReadings;
  const pickRiver = (next: RiverId | 'all') => {
    setRiver(next);
    setStationId(null);
  };
  const date = (iso: string) => formatLocaleDate(iso, locale);
  const name = (reading: StationReading) => placeName(reading.station.id, reading.station.name, locale);

  const card = (reading: StationReading) => (
    <article className="watch-card" key={reading.station.id}>
      <header className="watch-card-head">
        <h3>{name(reading)}</h3>
        <StatusBadge tone={TONE[reading.status]} label={statusLabel[reading.status]} hint={statusHint[reading.status]} />
      </header>
      <dl className="watch-figures">
        <div>
          <dt>{copy.flowToday}</dt>
          <dd>
            {reading.today ? formatFlow(reading.today.value) : '–'} <span>{copy.flowUnit}</span>
          </dd>
        </div>
        <div>
          <dt>{copy.flowPeak}</dt>
          <dd>
            {reading.peak ? formatFlow(reading.peak.value) : '–'} <span>{copy.flowUnit}</span>
            {reading.peak ? <small>{date(reading.peak.date)}</small> : null}
          </dd>
        </div>
      </dl>
      <FlowChart
        points={reading.points}
        p90={reading.station.p90}
        p98={reading.station.p98}
        labels={{
          p90: copy.flowP90,
          p98: copy.flowP98,
          past: copy.flowPast,
          forecast: copy.flowForecast,
          unit: copy.flowUnit,
        }}
        formatDate={date}
        summary={`${name(reading)}: ${statusLabel[reading.status]}. ${copy.flowToday} ${
          reading.today ? formatFlow(reading.today.value) : '–'
        } ${copy.flowUnit}; ${copy.flowPeak} ${reading.peak ? formatFlow(reading.peak.value) : '–'} ${copy.flowUnit}.`}
      />
    </article>
  );

  const rivers: RiverId[] = ['shabelle', 'juba'];
  const ORDER: Record<FlowStatus, number> = { high: 0, elevated: 1, normal: 2 };
  const worstIn = (id: RiverId): FlowStatus =>
    readings
      .filter((reading) => reading.station.river === id)
      .reduce<FlowStatus>((worst, reading) => (ORDER[reading.status] < ORDER[worst] ? reading.status : worst), 'normal');

  return (
    <article className="detail watch-page" aria-label={copy.floodWatch}>
      <AutoplayScroll />
      <h1>{copy.floodWatch}</h1>
      <p className="watch-intro">{copy.floodWatchIntro}</p>
      <WatchDisclaimer />
      <StatusLegend
        items={(['normal', 'elevated', 'high'] as FlowStatus[]).map((status) => ({
          tone: TONE[status],
          label: statusLabel[status],
          hint: statusHint[status],
        }))}
      />
      <WatchStatusMessage state={state} />

      {readings.length ? (
        <>
          <WatchMap
            label={copy.watchMap}
            fitToPoints={river !== 'all' || !!chosen}
            points={onMap.map((reading) => ({
              id: reading.station.id,
              name: name(reading),
              lat: reading.station.lat,
              lng: reading.station.lng,
              tone: TONE[reading.status],
              detail: `${statusLabel[reading.status]} · ${copy.flowPeak}: ${
                reading.peak ? formatFlow(reading.peak.value) : '–'
              } ${copy.flowUnit}`,
            }))}
            selectedId={chosen?.station.id ?? null}
            onSelect={(id) => {
              const station = readings.find((reading) => reading.station.id === id)?.station;
              if (!station) return;
              setRiver(station.river);
              setStationId(station.id);
            }}
            controls={
              <div className="station-selects station-selects-overlay">
                <label>
                  <span>{copy.riverChoose}</span>
                  <select value={river} onChange={(event) => pickRiver(event.target.value as RiverId | 'all')}>
                    <option value="all">{copy.riverAll}</option>
                    {rivers.map((id) => (
                      <option key={id} value={id}>
                        {riverLabel[id]} · {statusLabel[worstIn(id)]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>{copy.flowStation}</span>
                  <select value={chosen?.station.id ?? 'all'} onChange={(event) => setStationId(event.target.value === 'all' ? null : event.target.value)}>
                    <option value="all">{copy.townAll}</option>
                    {riverReadings.map((reading) => (
                      <option key={reading.station.id} value={reading.station.id}>
                        {name(reading)} · {statusLabel[reading.status]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            }
            side={
              chosen ? (
                <>
                  <button type="button" className="side-back" onClick={() => setStationId(null)}>
                    ← {copy.townAll}
                  </button>
                  {card(chosen)}
                </>
              ) : (
                <div className="side-list">
                  <h3>{river === 'all' ? copy.riverAll : riverLabel[river]}</h3>
                  <ul>
                    {riverReadings.map((reading) => (
                      <li key={reading.station.id}>
                        <button type="button" onClick={() => {
                          setRiver(reading.station.river);
                          setStationId(reading.station.id);
                        }}>
                          <StatusIcon tone={TONE[reading.status]} />
                          <span className="side-list-name">{name(reading)}</span>
                          <span className="side-list-value">
                            {reading.today ? formatFlow(reading.today.value) : '–'} {copy.flowUnit}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            }
          />
          <details className="watch-table">
            <summary>{copy.watchDataTable}</summary>
            <table>
              <thead>
                <tr>
                  <th scope="col">{copy.flowStation}</th>
                  <th scope="col">{copy.watchStatus}</th>
                  <th scope="col">{copy.flowToday}</th>
                  <th scope="col">{copy.flowPeak}</th>
                  <th scope="col">{copy.flowP90}</th>
                  <th scope="col">{copy.flowP98}</th>
                </tr>
              </thead>
              <tbody>
                {readings.map((reading) => (
                  <tr key={reading.station.id}>
                    <th scope="row">
                      {name(reading)} ({riverLabel[reading.station.river]})
                    </th>
                    <td>{statusLabel[reading.status]}</td>
                    <td>{reading.today ? formatFlow(reading.today.value) : '–'}</td>
                    <td>{reading.peak ? `${formatFlow(reading.peak.value)} (${date(reading.peak.date)})` : '–'}</td>
                    <td>{formatFlow(reading.station.p90)}</td>
                    <td>{formatFlow(reading.station.p98)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="watch-how">
              {copy.flowUnit} · {copy.watchUpdated} {date(todayIso)}
            </p>
          </details>
        </>
      ) : null}
      <FloodHistoryMap />
      <WatchSources sources={SOURCES} />
    </article>
  );
}
