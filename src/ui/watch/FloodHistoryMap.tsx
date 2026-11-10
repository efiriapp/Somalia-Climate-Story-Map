import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { CircleMarker, GeoJSON, MapContainer, ScaleControl, Tooltip, useMap } from 'react-leaflet';
import type { Feature, FeatureCollection } from 'geojson';
import L, { type PathOptions } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  COMPARE_COLORS,
  YEAR_RAMP,
  compareAreas,
  floodArea,
  floodEventLabel,
  floodEvents,
  yearColor,
  type FloodEvent,
} from '../../application/flood-history';
import { formatLocaleDate } from '../../application/locale';
import type { MapLayerId } from '../../application/map-layers';
import { useLocale } from '../chrome/LocaleContext';
import { LeafletRasterBasemap } from '../map/LeafletRasterBasemap';
import { useWatchFiles, useWatchManifest } from '../useWatchData';

type Mode = 'single' | 'all' | 'compare';
type Panel = 'filter' | 'layers' | 'compare' | null;

/** Juba and Shabelle valleys, with room for the wide Deyr 2023 floods. */
const FLOOD_BOUNDS: [[number, number], [number, number]] = [
  [-1.8, 40.9],
  [6.0, 47.0],
];

const FARMLAND = '#1baf7a';
const FLOOD_BLUE = COMPARE_COLORS.a;
const PLAIN = '#cfe6f2';
const RIVER = '#1b4f8a';
const GAUGE = '#d03b3b';

type Collection = FeatureCollection & { features: Feature[] };

/** Zooms to the floods on show whenever the selection changes. */
function FitToFloods({ data, selectionKey }: { data: Collection[]; selectionKey: string }) {
  const map = useMap();
  useEffect(() => {
    if (!data.length) return;
    const bounds = L.latLngBounds([]);
    for (const collection of data) {
      const layerBounds = L.geoJSON(collection).getBounds();
      if (layerBounds.isValid()) bounds.extend(layerBounds);
    }
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [24, 24], maxZoom: 11 });
    // Refit only when the selection changes or its files finish loading.
  }, [map, selectionKey, data.length]);
  return null;
}

function Icon({ name }: { name: 'filter' | 'layers' | 'compare' }) {
  const paths: Record<typeof name, ReactNode> = {
    filter: <path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z" />,
    layers: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 13 9 5 9-5" />
      </>
    ),
    compare: (
      <>
        <rect x="3" y="5" width="8" height="14" rx="1.5" />
        <rect x="13" y="5" width="8" height="14" rx="1.5" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

/**
 * Past floods on the Juba and Shabelle (FAO SWALIM flood extents): pick one
 * flood, show all of them shaded by year, or compare two side by side in
 * contrasting colours. Rivers, gauging stations, the flood plain and the
 * basemap can be switched in the layers panel.
 */
export function FloodHistoryMap() {
  const { copy, locale } = useLocale();
  const { data: manifest, error } = useWatchManifest();
  const events = useMemo(() => (manifest ? floodEvents(manifest) : []), [manifest]);
  const date = (iso: string) => formatLocaleDate(iso, locale);
  const label = (event: FloodEvent) => floodEventLabel(event, locale, date);

  const [mode, setMode] = useState<Mode>('single');
  const [selected, setSelected] = useState<string | null>(null);
  const [pairA, setPairA] = useState<string | null>(null);
  const [pairB, setPairB] = useState<string | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [show, setShow] = useState({ rivers: true, gauges: true, plain: false });
  const [basemap, setBasemap] = useState<MapLayerId>('streets');

  // Defaults once the list arrives: the newest basin-wide flood (Gu 2025 maps
  // only one area near Jowhar); compare Deyr 2019 with El Niño Deyr 2023.
  useEffect(() => {
    if (!events.length) return;
    const basinWide = events.filter((event) => !event.id.endsWith('-jowhar'));
    setSelected((s) => s ?? (basinWide.at(-1) ?? events.at(-1)!).id);
    setPairA((a) => a ?? (events.find((e) => e.id === 'flood-deyr-2019') ?? events.at(-2) ?? events[0]!).id);
    setPairB((b) => b ?? (events.find((e) => e.id === 'flood-deyr-2023') ?? events.at(-1)!).id);
  }, [events]);

  const byId = (id: string | null) => events.find((event) => event.id === id);
  const visible: FloodEvent[] =
    mode === 'all'
      ? events
      : mode === 'compare'
        ? [byId(pairA), byId(pairB)].filter((e): e is FloodEvent => !!e)
        : [byId(selected)].filter((e): e is FloodEvent => !!e);

  const files = [
    ...(show.plain ? ['flood-plain-2013-2023.geojson'] : []),
    ...visible.map((event) => event.file),
    ...(show.rivers ? ['rivers.geojson'] : []),
    ...(show.gauges ? ['river-gauging-stations.geojson'] : []),
  ];
  const { ready, loading } = useWatchFiles<Collection>(files);

  const first = events[0]?.year ?? 2013;
  const last = events.at(-1)?.year ?? 2025;

  const styleFor = (event: FloodEvent) => (feature?: Feature): PathOptions => {
    let fill: string = FLOOD_BLUE;
    if (mode === 'all') fill = yearColor(event.year, first, last);
    else if (mode === 'compare') fill = event.id === pairA ? COMPARE_COLORS.a : COMPARE_COLORS.b;
    else if (/farmland/i.test(String(feature?.properties?.type ?? ''))) fill = FARMLAND;
    return {
      color: fill,
      weight: mode === 'all' ? 0.4 : 0.8,
      fillColor: fill,
      fillOpacity: mode === 'compare' ? 0.5 : mode === 'all' ? 0.55 : 0.65,
    };
  };

  const areaOf = (event: FloodEvent | undefined) =>
    event && ready[event.file] ? floodArea(ready[event.file]!.features) : null;
  const ha = (value: number) => `${Math.round(value).toLocaleString('en')} ${copy.hectares}`;

  const current = mode === 'single' ? byId(selected) : undefined;
  const currentArea = areaOf(current);
  const typed = currentArea?.farmland !== null && currentArea?.farmland !== undefined;
  const a = byId(pairA);
  const b = byId(pairB);
  const areaA = areaOf(a);
  const areaB = areaOf(b);

  const toggle = (name: Exclude<Panel, null>) => setPanel((open) => (open === name ? null : name));

  const years = [...new Set(events.map((event) => event.year))].sort((x, y) => y - x);

  if (error) {
    return (
      <p className="watch-message watch-message-error" role="alert">
        {copy.watchError}
      </p>
    );
  }

  return (
    <section className="flood-history" aria-label={copy.floodHistory}>
      <h2>{copy.floodHistory}</h2>
      <p className="watch-how">{copy.floodHistoryIntro}</p>

      <div className="flood-map-wrap">
        <MapContainer bounds={FLOOD_BOUNDS} minZoom={5} maxZoom={13} scrollWheelZoom={false} preferCanvas>
          <LeafletRasterBasemap basemap={basemap} />
          {show.plain && ready['flood-plain-2013-2023.geojson'] ? (
            <GeoJSON
              key="plain"
              data={ready['flood-plain-2013-2023.geojson']}
              style={{ color: PLAIN, weight: 0, fillColor: PLAIN, fillOpacity: 0.7 }}
            />
          ) : null}
          {visible.map((event) =>
            ready[event.file] ? (
              <GeoJSON
                key={`${event.id}-${mode}-${pairA}-${pairB}`}
                data={ready[event.file]!}
                style={styleFor(event)}
                onEachFeature={(_feature, layer) => layer.bindTooltip(label(event), { sticky: true })}
              />
            ) : null,
          )}
          {show.rivers && ready['rivers.geojson'] ? (
            <GeoJSON key="rivers" data={ready['rivers.geojson']} style={{ color: RIVER, weight: 2, opacity: 0.9 }} />
          ) : null}
          {show.gauges && ready['river-gauging-stations.geojson']
            ? ready['river-gauging-stations.geojson'].features.map((feature) => {
                const [lng, lat] = (feature.geometry as unknown as { coordinates: [number, number] }).coordinates;
                return (
                  <CircleMarker
                    key={String(feature.properties?.name)}
                    center={[lat, lng]}
                    radius={6}
                    pathOptions={{ color: '#ffffff', weight: 2, fillColor: GAUGE, fillOpacity: 1 }}
                  >
                    <Tooltip direction="top">
                      {String(feature.properties?.name)} · {copy.layerGauges}
                    </Tooltip>
                  </CircleMarker>
                );
              })
            : null}
          <FitToFloods
            data={visible.map((event) => ready[event.file]).filter((c): c is Collection => !!c)}
            selectionKey={`${mode}:${visible.map((event) => event.id).join(',')}`}
          />
          <ScaleControl position="bottomleft" imperial={false} />
        </MapContainer>

        <div className="flood-map-tools" role="toolbar" aria-label={copy.floodHistory}>
          <button type="button" aria-expanded={panel === 'filter'} aria-label={copy.floodFilter} title={copy.floodFilter} className={panel === 'filter' ? 'active' : ''} onClick={() => toggle('filter')}>
            <Icon name="filter" />
          </button>
          <button type="button" aria-expanded={panel === 'compare'} aria-label={copy.floodCompare} title={copy.floodCompare} className={mode === 'compare' || panel === 'compare' ? 'active' : ''} onClick={() => toggle('compare')}>
            <Icon name="compare" />
          </button>
          <button type="button" aria-expanded={panel === 'layers'} aria-label={copy.mapLayers} title={copy.mapLayers} className={panel === 'layers' ? 'active' : ''} onClick={() => toggle('layers')}>
            <Icon name="layers" />
          </button>
        </div>

        {panel ? (
          <div className="flood-map-panel" role="dialog" aria-label={panel === 'filter' ? copy.floodFilter : panel === 'compare' ? copy.floodCompare : copy.mapLayers}>
            <div className="flood-map-panel-head">
              <strong>{panel === 'filter' ? copy.floodFilter : panel === 'compare' ? copy.floodCompare : copy.mapLayers}</strong>
              <button type="button" onClick={() => setPanel(null)} aria-label={copy.mapClose}>
                ×
              </button>
            </div>

            {panel === 'filter' ? (
              <div className="flood-filter">
                <button type="button" aria-pressed={mode === 'all'} className={mode === 'all' ? 'active' : ''} onClick={() => setMode('all')}>
                  {copy.floodAll} ({events.length})
                </button>
                {years.map((year) => (
                  <div key={year} className="flood-filter-year">
                    <span>{year}</span>
                    {events
                      .filter((event) => event.year === year)
                      .map((event) => (
                        <button
                          key={event.id}
                          type="button"
                          aria-pressed={mode === 'single' && selected === event.id}
                          className={mode === 'single' && selected === event.id ? 'active' : ''}
                          onClick={() => {
                            setSelected(event.id);
                            setMode('single');
                          }}
                        >
                          {label(event).replace(` ${year}`, '')}
                        </button>
                      ))}
                  </div>
                ))}
              </div>
            ) : null}

            {panel === 'compare' ? (
              <div className="flood-compare-form">
                {(
                  [
                    ['a', copy.floodCompareA, pairA, setPairA],
                    ['b', copy.floodCompareB, pairB, setPairB],
                  ] as const
                ).map(([key, title, value, set]) => (
                  <label key={key}>
                    <span className="swatch" style={{ background: COMPARE_COLORS[key] }} aria-hidden="true" />
                    {title}
                    <select value={value ?? ''} onChange={(event) => { set(event.target.value); setMode('compare'); }}>
                      {events.map((event) => (
                        <option key={event.id} value={event.id}>
                          {label(event)}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
                <button type="button" className={mode === 'compare' ? 'active' : ''} onClick={() => setMode(mode === 'compare' ? 'single' : 'compare')}>
                  {mode === 'compare' ? copy.floodCompareOff : copy.floodCompare}
                </button>
              </div>
            ) : null}

            {panel === 'layers' ? (
              <div className="flood-layers">
                {(
                  [
                    ['rivers', copy.layerRivers],
                    ['gauges', copy.layerGauges],
                    ['plain', copy.layerFloodPlain],
                  ] as const
                ).map(([key, title]) => (
                  <label key={key}>
                    <input type="checkbox" checked={show[key]} onChange={() => setShow((s) => ({ ...s, [key]: !s[key] }))} />
                    {title}
                  </label>
                ))}
                <fieldset>
                  <legend>{copy.mapLayers}</legend>
                  {(
                    [
                      ['streets', copy.basemapStreets],
                      ['satellite', copy.basemapSatellite],
                      ['terrain', copy.basemapTerrain],
                    ] as const
                  ).map(([key, title]) => (
                    <label key={key}>
                      <input type="radio" name="flood-basemap" checked={basemap === key} onChange={() => setBasemap(key)} />
                      {title}
                    </label>
                  ))}
                </fieldset>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flood-map-legend" aria-label="Legend">
          {mode === 'all' ? (
            <>
              <div className="legend-ramp" style={{ background: `linear-gradient(90deg, ${YEAR_RAMP.join(', ')})` }} aria-hidden="true" />
              <div className="legend-ramp-labels">
                <span>
                  {copy.floodOlder} · {first}
                </span>
                <span>
                  {last} · {copy.floodNewer}
                </span>
              </div>
            </>
          ) : mode === 'compare' ? (
            <>
              <LegendItem color={COMPARE_COLORS.a} text={a ? `${copy.floodCompareA}: ${label(a)}` : copy.floodCompareA} />
              <LegendItem color={COMPARE_COLORS.b} text={b ? `${copy.floodCompareB}: ${label(b)}` : copy.floodCompareB} />
            </>
          ) : typed ? (
            <>
              <LegendItem color={FARMLAND} text={copy.floodedFarmland} />
              <LegendItem color={FLOOD_BLUE} text={copy.floodedOther} />
            </>
          ) : (
            <LegendItem color={FLOOD_BLUE} text={current ? label(current) : copy.floodedArea} />
          )}
          {show.plain ? <LegendItem color={PLAIN} text={copy.layerFloodPlain} /> : null}
          {show.rivers ? <LegendItem color={RIVER} text={copy.layerRivers} line /> : null}
          {show.gauges ? <LegendItem color={GAUGE} text={copy.layerGauges} dot /> : null}
        </div>

        {loading ? (
          <p className="flood-map-loading" role="status">
            {copy.watchLoading}
          </p>
        ) : null}
      </div>

      <div className="flood-summary" aria-live="polite">
        {mode === 'all' ? (
          <p>
            <strong>{events.length}</strong> {copy.floodsShown} ({first}–{last})
          </p>
        ) : null}
        {mode === 'single' && current ? (
          <dl className="watch-figures">
            <div>
              <dt>{label(current)}</dt>
              <dd>{currentArea ? ha(currentArea.total) : '–'}</dd>
            </div>
            {typed ? (
              <>
                <div>
                  <dt>{copy.floodedFarmland}</dt>
                  <dd>{ha(currentArea!.farmland!)}</dd>
                </div>
                <div>
                  <dt>{copy.floodedOther}</dt>
                  <dd>{ha(currentArea!.other!)}</dd>
                </div>
              </>
            ) : null}
          </dl>
        ) : null}
        {mode === 'compare' && a && b ? (
          <table className="flood-compare-table">
            <thead>
              <tr>
                <th scope="col">{copy.floodCompare}</th>
                <th scope="col">{copy.floodedArea}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">
                  <span className="swatch" style={{ background: COMPARE_COLORS.a }} aria-hidden="true" /> {copy.floodCompareA}: {label(a)}
                </th>
                <td>{areaA ? ha(areaA.total) : '–'}</td>
              </tr>
              <tr>
                <th scope="row">
                  <span className="swatch" style={{ background: COMPARE_COLORS.b }} aria-hidden="true" /> {copy.floodCompareB}: {label(b)}
                </th>
                <td>{areaB ? ha(areaB.total) : '–'}</td>
              </tr>
              {areaA && areaB ? (
                <tr>
                  <th scope="row">{copy.floodDifference}</th>
                  <td>
                    {(() => {
                      const { diff, percent } = compareAreas(areaA.total, areaB.total);
                      return `${diff >= 0 ? '+' : '−'}${ha(Math.abs(diff))}${percent !== null ? ` (${percent >= 0 ? '+' : '−'}${Math.abs(percent)}%)` : ''}`;
                    })()}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        ) : null}
      </div>
    </section>
  );
}

function LegendItem({ color, text, line, dot }: { color: string; text: string; line?: boolean; dot?: boolean }) {
  return (
    <div className="legend-item">
      <span
        className={line ? 'legend-key legend-line' : dot ? 'legend-key legend-dot' : 'legend-key'}
        style={{ background: color }}
        aria-hidden="true"
      />
      <span>{text}</span>
    </div>
  );
}
