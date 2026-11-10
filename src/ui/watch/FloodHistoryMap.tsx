import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { CircleMarker, GeoJSON, MapContainer, Pane, ScaleControl, Tooltip, useMap } from 'react-leaflet';
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

type Panel = 'layers' | 'compare' | null;
type Collection = FeatureCollection & { features: Feature[] };

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
const ALL = 'all';

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

/**
 * Swipe compare, as in Esri's swipe widget: Flood A's pane is clipped to the
 * left of the divider and Flood B's to the right. Each pane has its own
 * canvas, so the clip follows the map as it pans and zooms.
 */
function SwipeClip({ ratio }: { ratio: number }) {
  const map = useMap();
  useEffect(() => {
    const paneA = map.getPane('swipe-a');
    const paneB = map.getPane('swipe-b');
    if (!paneA || !paneB) return;
    const update = () => {
      const size = map.getSize();
      const nw = map.containerPointToLayerPoint([0, 0]);
      const se = map.containerPointToLayerPoint(size);
      const x = nw.x + size.x * ratio;
      paneA.style.clip = `rect(${nw.y}px, ${x}px, ${se.y}px, ${nw.x}px)`;
      paneB.style.clip = `rect(${nw.y}px, ${se.x}px, ${se.y}px, ${x}px)`;
    };
    update();
    map.on('move zoom zoomend resize viewreset', update);
    return () => {
      map.off('move zoom zoomend resize viewreset', update);
      paneA.style.clip = '';
      paneB.style.clip = '';
    };
  }, [map, ratio]);
  return null;
}

function Icon({ name }: { name: 'calendar' | 'layers' | 'compare' }) {
  const paths: Record<typeof name, ReactNode> = {
    calendar: (
      <>
        <rect x="3.5" y="5" width="17" height="15" rx="2" />
        <path d="M3.5 10h17M8 3v4M16 3v4" />
        <path d="M8 14h2M12 14h2M16 14h0.01M8 17h2M12 17h2" />
      </>
    ),
    layers: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 13 9 5 9-5" />
      </>
    ),
    compare: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M12 2v20" />
        <path d="m8 10-2 2 2 2M16 10l2 2-2 2" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

/**
 * Past floods on the Juba and Shabelle (FAO SWALIM flood extents). Opens with
 * all floods shaded by year; the date dropdown picks one flood; the swipe
 * compare shows two floods either side of a draggable divider. Rivers,
 * gauging stations, the flood plain and the basemap are in the layers panel.
 */
export function FloodHistoryMap() {
  const { copy, locale } = useLocale();
  const { data: manifest, error } = useWatchManifest();
  const events = useMemo(() => (manifest ? floodEvents(manifest) : []), [manifest]);
  const date = (iso: string) => formatLocaleDate(iso, locale);
  const label = (event: FloodEvent) => floodEventLabel(event, locale, date);

  const [view, setView] = useState<string>(ALL);
  const [comparing, setComparing] = useState(false);
  const [pairA, setPairA] = useState<string | null>(null);
  const [pairB, setPairB] = useState<string | null>(null);
  const [ratio, setRatio] = useState(0.5);
  const [panel, setPanel] = useState<Panel>(null);
  const [show, setShow] = useState({ rivers: true, gauges: true, plain: false });
  const [basemap, setBasemap] = useState<MapLayerId>('streets');
  const wrap = useRef<HTMLDivElement>(null);

  // Compare defaults: Deyr 2019 against El Niño Deyr 2023.
  useEffect(() => {
    if (!events.length) return;
    setPairA((a) => a ?? (events.find((e) => e.id === 'flood-deyr-2019') ?? events.at(-2) ?? events[0]!).id);
    setPairB((b) => b ?? (events.find((e) => e.id === 'flood-deyr-2023') ?? events.at(-1)!).id);
  }, [events]);

  const byId = (id: string | null) => events.find((event) => event.id === id);
  const a = byId(pairA);
  const b = byId(pairB);
  const single = view === ALL ? undefined : byId(view);
  const shown: FloodEvent[] = comparing
    ? [a, b].filter((e): e is FloodEvent => !!e)
    : view === ALL
      ? events
      : [single].filter((e): e is FloodEvent => !!e);

  const files = [
    ...(show.plain ? ['flood-plain-2013-2023.geojson'] : []),
    ...shown.map((event) => event.file),
    ...(show.rivers ? ['rivers.geojson'] : []),
    ...(show.gauges ? ['river-gauging-stations.geojson'] : []),
  ];
  const { ready, loading } = useWatchFiles<Collection>(files);

  const first = events[0]?.year ?? 2013;
  const last = events.at(-1)?.year ?? 2025;

  const styleFor = (event: FloodEvent, color?: string) => (feature?: Feature): PathOptions => {
    let fill: string = color ?? FLOOD_BLUE;
    if (!color) {
      if (view === ALL) fill = yearColor(event.year, first, last);
      else if (/farmland/i.test(String(feature?.properties?.type ?? ''))) fill = FARMLAND;
    }
    return {
      color: fill,
      weight: view === ALL && !color ? 0.4 : 0.8,
      fillColor: fill,
      fillOpacity: color ? 0.7 : view === ALL ? 0.55 : 0.65,
    };
  };

  const areaOf = (event: FloodEvent | undefined) =>
    event && ready[event.file] ? floodArea(ready[event.file]!.features) : null;
  const ha = (value: number) => `${Math.round(value).toLocaleString('en')} ${copy.hectares}`;
  const singleArea = areaOf(single);
  const typed = singleArea?.farmland !== null && singleArea?.farmland !== undefined;
  const areaA = areaOf(a);
  const areaB = areaOf(b);

  const years = [...new Set(events.map((event) => event.year))].sort((x, y) => y - x);

  // Divider dragging (pointer) and nudging (keyboard).
  const moveTo = (clientX: number) => {
    const box = wrap.current?.getBoundingClientRect();
    if (!box) return;
    setRatio(Math.min(0.97, Math.max(0.03, (clientX - box.left) / box.width)));
  };
  const onHandleDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    moveTo(event.clientX);
  };
  const onHandleMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) moveTo(event.clientX);
  };
  const onHandleKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    setRatio((r) => Math.min(0.97, Math.max(0.03, r + (event.key === 'ArrowRight' ? 0.05 : -0.05))));
  };

  if (error) {
    return (
      <p className="watch-message watch-message-error" role="alert">
        {copy.watchError}
      </p>
    );
  }

  const floodLayer = (event: FloodEvent, color?: string) =>
    ready[event.file] ? (
      <GeoJSON
        key={`${event.id}-${view}-${comparing}-${color ?? ''}`}
        data={ready[event.file]!}
        style={styleFor(event, color)}
        onEachFeature={(_feature, layer) => layer.bindTooltip(label(event), { sticky: true })}
      />
    ) : null;

  return (
    <section className="flood-history" aria-label={copy.floodHistory}>
      <h2>{copy.floodHistory}</h2>
      <p className="watch-how">{copy.floodHistoryIntro}</p>

      <div className="flood-map-wrap">
        <div className="flood-map-stage" ref={wrap}>
        <MapContainer bounds={FLOOD_BOUNDS} minZoom={5} maxZoom={13} scrollWheelZoom={false} preferCanvas>
          <LeafletRasterBasemap basemap={basemap} />
          {show.plain && ready['flood-plain-2013-2023.geojson'] ? (
            <GeoJSON
              key="plain"
              data={ready['flood-plain-2013-2023.geojson']}
              style={{ color: PLAIN, weight: 0, fillColor: PLAIN, fillOpacity: 0.7 }}
            />
          ) : null}

          {comparing ? (
            <>
              <Pane name="swipe-a" style={{ zIndex: 410 }}>
                {a ? floodLayer(a, COMPARE_COLORS.a) : null}
              </Pane>
              <Pane name="swipe-b" style={{ zIndex: 411 }}>
                {b ? floodLayer(b, COMPARE_COLORS.b) : null}
              </Pane>
              <SwipeClip ratio={ratio} />
            </>
          ) : (
            shown.map((event) => floodLayer(event))
          )}

          {show.rivers && ready['rivers.geojson'] ? (
            <Pane name="rivers" style={{ zIndex: 420 }}>
              <GeoJSON key="rivers" data={ready['rivers.geojson']} style={{ color: RIVER, weight: 2, opacity: 0.9 }} />
            </Pane>
          ) : null}
          {show.gauges && ready['river-gauging-stations.geojson']
            ? ready['river-gauging-stations.geojson'].features.map((feature) => {
                const [lng, lat] = (feature.geometry as unknown as { coordinates: [number, number] }).coordinates;
                return (
                  <CircleMarker
                    key={String(feature.properties?.name)}
                    center={[lat, lng]}
                    radius={6}
                    pane="markerPane"
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
            data={shown.map((event) => ready[event.file]).filter((c): c is Collection => !!c)}
            selectionKey={`${comparing}:${shown.map((event) => event.id).join(',')}`}
          />
          <ScaleControl position="bottomleft" imperial={false} />
        </MapContainer>

        {/* Date filter: calendar icon with one compact dropdown. */}
        <label className={comparing ? 'flood-date-filter is-disabled' : 'flood-date-filter'} title={copy.floodFilter}>
          <Icon name="calendar" />
          <select
            aria-label={copy.floodFilter}
            value={view}
            disabled={comparing}
            onChange={(event) => setView(event.target.value)}
          >
            <option value={ALL}>
              {copy.floodAll} ({events.length})
            </option>
            {years.map((year) => (
              <optgroup key={year} label={String(year)}>
                {events
                  .filter((event) => event.year === year)
                  .map((event) => (
                    <option key={event.id} value={event.id}>
                      {label(event)}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>

        <div className="flood-map-tools" role="toolbar" aria-label={copy.floodHistory}>
          <button
            type="button"
            aria-pressed={comparing}
            aria-label={comparing ? copy.floodCompareOff : copy.floodCompare}
            title={comparing ? copy.floodCompareOff : copy.floodCompare}
            className={comparing ? 'active' : ''}
            onClick={() => {
              setComparing((on) => !on);
              setPanel((open) => (comparing ? (open === 'compare' ? null : open) : 'compare'));
              setRatio(0.5);
            }}
          >
            <Icon name="compare" />
          </button>
          <button
            type="button"
            aria-expanded={panel === 'layers'}
            aria-label={copy.mapLayers}
            title={copy.mapLayers}
            className={panel === 'layers' ? 'active' : ''}
            onClick={() => setPanel((open) => (open === 'layers' ? null : 'layers'))}
          >
            <Icon name="layers" />
          </button>
        </div>

        {comparing ? (
          <>
            <div className="swipe-labels" aria-hidden="true">
              <span className="swipe-label swipe-label-a">
                <span className="swatch" style={{ background: COMPARE_COLORS.a }} /> A · {a ? label(a) : ''}
              </span>
              <span className="swipe-label swipe-label-b">
                B · {b ? label(b) : ''} <span className="swatch" style={{ background: COMPARE_COLORS.b }} />
              </span>
            </div>
            <div className="swipe-divider" style={{ left: `${ratio * 100}%` }}>
              <button
                type="button"
                className="swipe-handle"
                role="slider"
                aria-label={copy.swipeHandle}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(ratio * 100)}
                aria-orientation="horizontal"
                onPointerDown={onHandleDown}
                onPointerMove={onHandleMove}
                onKeyDown={onHandleKey}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 7-5 5 5 5M15 7l5 5-5 5" />
                </svg>
              </button>
            </div>
          </>
        ) : null}

        <div className="flood-map-legend" aria-label="Legend">
          {comparing ? (
            <>
              <LegendItem color={COMPARE_COLORS.a} text={a ? `${copy.floodCompareA} (←): ${label(a)}` : copy.floodCompareA} />
              <LegendItem color={COMPARE_COLORS.b} text={b ? `${copy.floodCompareB} (→): ${label(b)}` : copy.floodCompareB} />
            </>
          ) : view === ALL ? (
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
          ) : typed ? (
            <>
              <LegendItem color={FARMLAND} text={copy.floodedFarmland} />
              <LegendItem color={FLOOD_BLUE} text={copy.floodedOther} />
            </>
          ) : (
            <LegendItem color={FLOOD_BLUE} text={single ? label(single) : copy.floodedArea} />
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

        {panel ? (
          <div className="flood-map-panel" role="dialog" aria-label={panel === 'compare' ? copy.floodCompare : copy.mapLayers}>
            <div className="flood-map-panel-head">
              <strong>{panel === 'compare' ? copy.floodCompare : copy.mapLayers}</strong>
              <button type="button" onClick={() => setPanel(null)} aria-label={copy.mapClose}>
                ×
              </button>
            </div>

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
                    {title} ({key === 'a' ? '←' : '→'})
                    <select value={value ?? ''} onChange={(event) => set(event.target.value)}>
                      {events
                        .slice()
                        .reverse()
                        .map((event) => (
                          <option key={event.id} value={event.id}>
                            {label(event)}
                          </option>
                        ))}
                    </select>
                  </label>
                ))}
                <p className="watch-how">{copy.swipeHint}</p>
                <button
                  type="button"
                  className="active"
                  onClick={() => {
                    setComparing(false);
                    setPanel(null);
                  }}
                >
                  {copy.floodCompareOff}
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

      </div>

      <div className="flood-summary" aria-live="polite">
        {!comparing && view === ALL ? (
          <p>
            <strong>{events.length}</strong> {copy.floodsShown} ({first}–{last})
          </p>
        ) : null}
        {!comparing && single ? (
          <dl className="watch-figures">
            <div>
              <dt>{label(single)}</dt>
              <dd>{singleArea ? ha(singleArea.total) : '–'}</dd>
            </div>
            {typed ? (
              <>
                <div>
                  <dt>{copy.floodedFarmland}</dt>
                  <dd>{ha(singleArea!.farmland!)}</dd>
                </div>
                <div>
                  <dt>{copy.floodedOther}</dt>
                  <dd>{ha(singleArea!.other!)}</dd>
                </div>
              </>
            ) : null}
          </dl>
        ) : null}
        {comparing && a && b ? (
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
                  <span className="swatch" style={{ background: COMPARE_COLORS.a }} aria-hidden="true" /> {copy.floodCompareA} (←): {label(a)}
                </th>
                <td>{areaA ? ha(areaA.total) : '–'}</td>
              </tr>
              <tr>
                <th scope="row">
                  <span className="swatch" style={{ background: COMPARE_COLORS.b }} aria-hidden="true" /> {copy.floodCompareB} (→): {label(b)}
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
