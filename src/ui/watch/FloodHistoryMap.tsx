import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { CircleMarker, GeoJSON, MapContainer, Marker, Pane, ScaleControl, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import type { Feature, FeatureCollection } from 'geojson';
import L, { type PathOptions } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  COMPARE_COLORS,
  YEAR_RAMP,
  areaByUnit,
  compareAreas,
  floodArea,
  floodEventLabel,
  floodEvents,
  floodPeriods,
  periodKey,
  periodLabel,
  yearColor,
  type AdminLevel,
  type FloodByAdmin,
  type FloodEvent,
} from '../../application/flood-history';
import { formatLocaleDate } from '../../application/locale';
import type { MapLayerId } from '../../application/map-layers';
import { useLocale } from '../chrome/LocaleContext';
import { FullscreenButton, MapAutoResize, useFullscreen } from '../map/MapFullscreen';
import { MapHomeControl } from '../map/MapHomeControl';
import { FitSelection } from '../map/FitSelection';
import { SOMALIA_BOUNDS, type LatLngBoundsTuple } from '../../application/resolve-map-view';
import { LeafletRasterBasemap } from '../map/LeafletRasterBasemap';
import { useWatchFile, useWatchFiles, useWatchManifest } from '../useWatchData';
import { FloodStatePanel } from './FloodStatePanel';

type Panel = 'layers' | 'compare' | null;
type Collection = FeatureCollection & { features: Feature[] };

const FARMLAND = '#1baf7a';
const FLOOD_BLUE = COMPARE_COLORS.a;
const PLAIN = '#cfe6f2';
const RIVER = '#1b4f8a';
const GAUGE = '#d03b3b';

/** Admin boundary outlines: states bold, regions thin, districts finest. */
const ADMIN_STYLE: Record<AdminLevel, PathOptions> = {
  state: { color: '#063D39', weight: 2, dashArray: '7 4', opacity: 0.85, fill: false },
  region: { color: '#3d3d3a', weight: 1.2, opacity: 0.7, fill: false },
  district: { color: '#6b6a66', weight: 0.7, dashArray: '2 3', opacity: 0.7, fill: false },
};
const ADMIN_FILE: Record<AdminLevel, string> = {
  state: 'admin-states.geojson',
  region: 'admin-regions.geojson',
  district: 'admin-districts.geojson',
};

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

/**
 * Names of the states, regions or districts on show. District names appear
 * for every district from zoom 8; further out only for districts in the
 * flooded-area list, so the map does not fill with text.
 */
/** Label size in px at zoom 5, and the largest it grows to. */
const LABEL_SIZE: Record<AdminLevel, { base: number; max: number }> = {
  state: { base: 9, max: 14 },
  region: { base: 8, max: 12 },
  district: { base: 7.5, max: 11 },
};

function AdminLabels({ data, level, listed }: { data: Collection; level: AdminLevel; listed: Set<string> }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });
  const all = level !== 'district' || zoom >= 8;
  // Small bold names that grow as the map is zoomed in.
  const size = Math.min(LABEL_SIZE[level].max, LABEL_SIZE[level].base + Math.max(0, zoom - 5) * 1.5);
  return (
    <>
      {data.features.map((feature) => {
        const { id, name, lx, ly } = (feature.properties ?? {}) as { id: string; name: string; lx?: number; ly?: number };
        if (lx === undefined || ly === undefined || (!all && !listed.has(id))) return null;
        const icon = L.divIcon({
          className: `admin-label admin-label-${level}`,
          html: `<span style="font-size:${size}px">${name.replace(/[&<>"]/g, '')}</span>`,
          iconSize: [0, 0],
        });
        return <Marker key={`${level}-${id}-${size}`} position={[ly, lx]} icon={icon} interactive={false} keyboard={false} />;
      })}
    </>
  );
}

function Icon({ name }: { name: 'calendar' | 'layers' | 'compare' | 'eye' | 'eyeOff' | 'states' }) {
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
    eye: (
      <>
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    eyeOff: (
      <>
        <path d="M2 12s3.6-7 10-7c2 0 3.7.7 5.1 1.6M22 12s-3.6 7-10 7c-2 0-3.7-.7-5.1-1.6" />
        <path d="m3 3 18 18" />
      </>
    ),
    states: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-7M21 20H3" />
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

  // Floods shown = ticked in the layers list AND inside the date filter.
  const [period, setPeriod] = useState<string>('all');
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  const [comparing, setComparing] = useState(false);
  const [pairA, setPairA] = useState<string | null>(null);
  const [pairB, setPairB] = useState<string | null>(null);
  const [ratio, setRatio] = useState(0.5);
  const [panel, setPanel] = useState<Panel>(null);
  const [show, setShow] = useState({
    rivers: true,
    gauges: true,
    plain: false,
  });
  const [areasOpen, setAreasOpen] = useState(true);
  const [level, setLevel] = useState<AdminLevel>('state');
  const { data: byAdmin } = useWatchFile<FloodByAdmin>('flood-by-admin.json');
  // One boundary level on the map at a time; it follows the panel's tab.
  const [boundary, setBoundary] = useState<AdminLevel | null>('state');
  const pickLevel = (next: AdminLevel) => {
    setLevel(next);
    setBoundary(next);
  };
  const pickBoundary = (next: AdminLevel | null) => {
    setBoundary(next);
    if (next) setLevel(next);
  };
  const [basemap, setBasemap] = useState<MapLayerId>('streets');
  const wrap = useRef<HTMLDivElement>(null);
  const outer = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(outer);

  // Compare defaults: Deyr 2019 against El Niño Deyr 2023.
  useEffect(() => {
    if (!events.length) return;
    setPairA((a) => a ?? (events.find((e) => e.id === 'flood-deyr-2019') ?? events.at(-2) ?? events[0]!).id);
    setPairB((b) => b ?? (events.find((e) => e.id === 'flood-deyr-2023') ?? events.at(-1)!).id);
  }, [events]);

  const byId = (id: string | null) => events.find((event) => event.id === id);
  const a = byId(pairA);
  const b = byId(pairB);
  const filtered = events.filter(
    (event) => !hidden.has(event.id) && (period === 'all' || periodKey(event) === period),
  );
  const shown: FloodEvent[] = comparing ? [a, b].filter((e): e is FloodEvent => !!e) : filtered;
  const single = !comparing && filtered.length === 1 ? filtered[0] : undefined;
  const many = !comparing && filtered.length > 1;
  const toggleFlood = (id: string) =>
    setHidden((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const files = [
    ...(show.plain ? ['flood-plain-2013-2023.geojson'] : []),
    ...(boundary ? [ADMIN_FILE[boundary]] : []),
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
      if (many) fill = yearColor(event.year, first, last);
      else if (/farmland/i.test(String(feature?.properties?.type ?? ''))) fill = FARMLAND;
    }
    return {
      color: fill,
      weight: many && !color ? 0.4 : 0.8,
      fillColor: fill,
      fillOpacity: color ? 0.7 : many ? 0.55 : 0.65,
    };
  };

  const areaOf = (event: FloodEvent | undefined) =>
    event && ready[event.file] ? floodArea(ready[event.file]!.features) : null;
  const ha = (value: number) => `${Math.round(value).toLocaleString('en')} ${copy.hectares}`;
  const singleArea = areaOf(single);
  const typed = singleArea?.farmland !== null && singleArea?.farmland !== undefined;
  const areaA = areaOf(a);
  const areaB = areaOf(b);

  const areaRows = !byAdmin
    ? []
    : comparing && a && b
      ? areaByUnit(byAdmin, level, [a.id], b.id)
      : areaByUnit(byAdmin, level, filtered.map((event) => event.id));
  const listed = new Set(areaRows.map((row) => row.id));

  // All floods on (the default) keeps the whole-Somalia view; otherwise zoom to the floods shown.
  const home = !comparing && period === 'all' && hidden.size === 0;
  const floodBounds = useMemo((): LatLngBoundsTuple | null => {
    const box = L.latLngBounds([]);
    for (const event of shown) {
      const collection = ready[event.file];
      if (collection) box.extend(L.geoJSON(collection).getBounds());
    }
    return box.isValid()
      ? [
          [box.getSouth(), box.getWest()],
          [box.getNorth(), box.getEast()],
        ]
      : null;
  }, [shown, ready]);

  const periods = floodPeriods(events);
  const newestFirst = [...events].reverse();
  const allOn = hidden.size === 0;

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
        key={`${event.id}-${many}-${comparing}-${color ?? ''}`}
        data={ready[event.file]!}
        style={styleFor(event, color)}
        onEachFeature={(_feature, layer) => layer.bindTooltip(label(event), { sticky: true })}
      />
    ) : null;

  return (
    <section className="flood-history" aria-label={copy.floodHistory}>
      <h2>{copy.floodHistory}</h2>
      <p className="watch-how">{copy.floodHistoryIntro}</p>

      <div className={areasOpen && byAdmin ? 'flood-map-wrap map-bleed has-areas' : 'flood-map-wrap map-bleed'} ref={outer}>
        <div className="flood-map-stage" ref={wrap}>
        <MapContainer bounds={SOMALIA_BOUNDS} minZoom={5} maxZoom={13} scrollWheelZoom={false} preferCanvas>
          <LeafletRasterBasemap basemap={basemap} />
          <MapAutoResize />
          <MapHomeControl label={copy.mapHome} />
          {show.plain && ready['flood-plain-2013-2023.geojson'] ? (
            <GeoJSON
              key="plain"
              data={ready['flood-plain-2013-2023.geojson']}
              style={{ color: PLAIN, weight: 0, fillColor: PLAIN, fillOpacity: 0.7 }}
            />
          ) : null}

          {boundary && ready[ADMIN_FILE[boundary]] ? (
            <>
              <GeoJSON
                key={boundary}
                data={ready[ADMIN_FILE[boundary]]!}
                style={ADMIN_STYLE[boundary]}
                onEachFeature={(feature, layer) => layer.bindTooltip(String(feature.properties?.name ?? ''), { sticky: true })}
              />
              <AdminLabels
                key={`labels-${boundary}`}
                data={ready[ADMIN_FILE[boundary]]!}
                level={boundary}
                listed={boundary === level ? listed : new Set()}
              />
            </>
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
          <FitSelection
            bounds={home ? null : floodBounds}
            selectionKey={`${comparing}:${shown.map((event) => event.id).join(',')}`}
          />
          <ScaleControl position="bottomleft" imperial={false} />
        </MapContainer>

        {/* Date filter: calendar icon with one list of the dates that have flood maps. */}
        <label className={comparing ? 'flood-date-filter is-disabled' : 'flood-date-filter'} title={copy.floodFilter}>
          <Icon name="calendar" />
          <select
            aria-label={copy.floodFilter}
            value={period}
            disabled={comparing}
            onChange={(event) => setPeriod(event.target.value)}
          >
            <option value="all">{copy.floodAllDates}</option>
            {periods.map((event) => (
              <option key={periodKey(event)} value={periodKey(event)}>
                {periodLabel(event, locale)}
              </option>
            ))}
          </select>
        </label>

        <div className="flood-map-tools" role="toolbar" aria-label={copy.floodHistory}>
          <FullscreenButton
            on={fullscreen.on}
            onToggle={fullscreen.toggle}
            labels={{ enter: copy.mapFullscreen, exit: copy.mapFullscreenExit }}
          />
          <button
            type="button"
            aria-pressed={areasOpen}
            aria-label={copy.stateArea}
            title={copy.stateArea}
            className={areasOpen ? 'active' : ''}
            onClick={() => setAreasOpen((open) => !open)}
          >
            <Icon name="states" />
          </button>
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
          ) : many ? (
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
          ) : single ? (
            <LegendItem color={FLOOD_BLUE} text={label(single)} />
          ) : (
            <span className="legend-empty">{copy.floodNone}</span>
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

        {areasOpen && byAdmin ? (
          <FloodStatePanel
            level={level}
            onLevel={pickLevel}
            rows={areaRows}
            subtitle={
              comparing && a && b
                ? copy.floodCompare
                : single
                  ? label(single)
                  : `${filtered.length} ${copy.floodsShown}`
            }
            compare={
              comparing && a && b
                ? { a: `${copy.floodCompareA}: ${label(a)}`, b: `${copy.floodCompareB}: ${label(b)}` }
                : undefined
            }
            onClose={() => setAreasOpen(false)}
          />
        ) : null}

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
                <fieldset className="flood-layer-list">
                  <legend>
                    {copy.floodLayers}
                    <button
                      type="button"
                      className="flood-layer-toggle"
                      aria-label={allOn ? copy.floodHideAll : copy.floodShowAll}
                      title={allOn ? copy.floodHideAll : copy.floodShowAll}
                      onClick={() => setHidden(allOn ? new Set(events.map((event) => event.id)) : new Set())}
                    >
                      <Icon name={allOn ? 'eye' : 'eyeOff'} />
                    </button>
                  </legend>
                  {newestFirst.map((event) => (
                    <label key={event.id}>
                      <input type="checkbox" checked={!hidden.has(event.id)} onChange={() => toggleFlood(event.id)} />
                      <span className="swatch" style={{ background: yearColor(event.year, first, last) }} aria-hidden="true" />
                      {label(event)}
                    </label>
                  ))}
                </fieldset>
                <fieldset>
                  <legend>{copy.layerBoundaries}</legend>
                  {(
                    [
                      [null, copy.boundaryNone],
                      ['state', copy.layerStates],
                      ['region', copy.layerRegions],
                      ['district', copy.layerDistricts],
                    ] as const
                  ).map(([key, title]) => (
                    <label key={key ?? 'none'}>
                      <input type="radio" name="flood-boundary" checked={boundary === key} onChange={() => pickBoundary(key)} />
                      {title}
                    </label>
                  ))}
                </fieldset>
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
        {many ? (
          <p>
            <strong>{filtered.length}</strong> {copy.floodsShown}
          </p>
        ) : null}
        {!comparing && !filtered.length ? <p>{copy.floodNone}</p> : null}
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
