import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AttributionControl, Map, Marker, NavigationControl, type GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  continentOfCountry,
  continentSummaries,
  defaultTourFilter,
  firstEventIndexByContinent,
  searchTourStops,
  summaryTotal,
} from '../../application/continent-visits';
import {
  distanceKm,
  greatCircle,
  pathCoordinates,
  type LngLat,
} from '../../application/flight-path';
import {
  buildGlobalTour,
  GLOBE_VIEW,
  COUNTRY_ZOOM,
  MOGADISHU_HOME,
  formatTourDate,
  nextTourIndex,
  prevTourIndex,
  type TourStop,
} from '../../application/global-tour';
import { styleForLayer } from '../../application/map-layers';
import type { Story } from '../../domain/story';
import { ContinentSummaryCards } from './ContinentSummaryCards';

type Props = {
  stories: Story[];
  onClose: () => void;
};

const applyFlatMap = (map: Map) => {
  const flatMap = map as Map & { setProjection?: (projection: { type: string }) => void };
  flatMap.setProjection?.({ type: 'mercator' });
};

const Icon = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    {children}
  </svg>
);

const SearchIcon = () => (
  <Icon>
    <circle cx="11" cy="11" r="7" />
    <path d="m16 16 5 5" />
  </Icon>
);

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M4 11.5 12 4l8 7.5V20H15v-6H9v6H4z" />
  </svg>
);

const MeasureIcon = () => (
  <Icon>
    <path d="M4 8h16v8H4z" />
    <path d="M7 8v4M10 8v3M13 8v4M16 8v3" />
  </Icon>
);

const CompassIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="9" />
    <path d="m12 4 2.2 6.4L12 20l-2.2-6.4z" />
  </Icon>
);

const PIN_HOLD_MS = 5000; // then flyHomeToSomalia
const TOUR_FLY_MS = 22000;
const HOME_FLY_MS = 22000;
const HOME_HOLD_MS = 4000;
const STAGE_PADDING = { top: 72, bottom: 80, left: 148, right: 332 };
let flyTimer = 0;

const emptyLine: GeoJSON.Feature = {
  type: 'Feature',
  properties: {},
  geometry: { type: 'LineString', coordinates: [] },
};

const lineData = (path: LngLat[]): GeoJSON.Feature => ({
  type: 'Feature',
  properties: {},
  geometry: { type: 'LineString', coordinates: pathCoordinates(path) },
});

const startTourPath = (map: Map, path: LngLat[]): LngLat | null => {
  const end = path.at(-1);
  if (!end) {
    return null;
  }
  const source = map.getSource('tour-path') as GeoJSONSource | undefined;
  source?.setData(lineData(path));
  map.stop();
  return end;
};

const afterEase = (duration: number, onDone: () => void) => {
  window.clearTimeout(flyTimer);
  flyTimer = window.setTimeout(onDone, duration);
};

export function GlobalStageMap({ stories, onClose }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const homeMarkerRef = useRef<Marker | null>(null);
  const measuringRef = useRef(false);
  const measurePointsRef = useRef<LngLat[]>([]);
  const touringRef = useRef(false);
  const tourToken = useRef(0);
  const holdRef = useRef(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [measuring, setMeasuring] = useState(false);
  const [measureKm, setMeasureKm] = useState<number | null>(null);
  const [tourCard, setTourCard] = useState<TourStop | null>(null);
  const tour = useMemo(() => buildGlobalTour(stories), [stories]);
  const events = useMemo(
    () => tour.filter((stop) => stop.kind === 'event').sort((a, b) => a.date.localeCompare(b.date)),
    [tour],
  );
  const summaries = useMemo(() => continentSummaries(stories, defaultTourFilter()), [stories]);
  const visitTotal = useMemo(() => summaryTotal(stories, defaultTourFilter()), [stories]);
  const eventsRef = useRef(events);
  eventsRef.current = events;
  const directionRef = useRef(1);
  const openStopRef = useRef<(stop: TourStop) => void>(() => undefined);
  const searchHits = useMemo(() => searchTourStops(events, searchQuery), [events, searchQuery]);
  const activeStop = events.find((stop) => stop.storyId === activeId);
  const activeContinent = activeStop ? continentOfCountry(activeStop.country) : undefined;

  const clearTourPath = (map: Map | null) => {
    const source = map?.getSource('tour-path') as GeoJSONSource | undefined;
    source?.setData(emptyLine);
  };

  const stopMotion = () => {
    window.clearTimeout(holdRef.current);
    window.clearTimeout(flyTimer);
    mapRef.current?.stop();
  };

  const hidePins = () => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    homeMarkerRef.current?.remove();
    homeMarkerRef.current = null;
  };

  const showAllPins = (map: Map) => {
    hidePins();
    homeMarkerRef.current = new Marker({ color: '#063D39' })
      .setLngLat([MOGADISHU_HOME.lng, MOGADISHU_HOME.lat])
      .addTo(map);
    const pins: Marker[] = [];
    for (const stop of eventsRef.current) {
      const marker = new Marker({ color: '#2E7D57' }).setLngLat([stop.lng, stop.lat]).addTo(map);
      const pin = marker.getElement();
      pin.style.cursor = 'pointer';
      pin.addEventListener('click', (event) => {
        event.stopPropagation();
        if (measuringRef.current) {
          return;
        }
        openStopRef.current(stop);
      });
      pins.push(marker);
    }
    markersRef.current = pins;
  };

  const openStop = (stop: TourStop) => {
    if (!stop.storyId) {
      return;
    }
    const map = mapRef.current;
    tourToken.current += 1;
    stopMotion();
    touringRef.current = false;
    setActiveId(stop.storyId);
    setTourCard(stop);
    if (!map) {
      return;
    }
    map.easeTo({
      center: [stop.lng, stop.lat],
      zoom: COUNTRY_ZOOM,
      pitch: 0,
      bearing: 0,
      duration: 2800,
      essential: true,
      easing: (t) => t,
    });
  };
  openStopRef.current = openStop;

  const iceOffice = { lng: MOGADISHU_HOME.lng, lat: MOGADISHU_HOME.lat };

  const flyHomeToSomalia = (token: number, from: LngLat, onArrive: () => void) => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    setTourCard(null);
    const end = startTourPath(map, greatCircle(from, iceOffice));
    if (!end) {
      onArrive();
      return;
    }
    map.easeTo({
      center: [end.lng, end.lat],
      zoom: COUNTRY_ZOOM,
      pitch: 0,
      bearing: 0,
      duration: HOME_FLY_MS,
      essential: true,
      easing: (t) => t,
    });
    afterEase(HOME_FLY_MS, () => {
      if (token !== tourToken.current) {
        return;
      }
      holdRef.current = window.setTimeout(() => {
        if (token !== tourToken.current) {
          return;
        }
        onArrive();
      }, HOME_HOLD_MS);
    });
  };

  const flyToStop = (token: number, from: LngLat, stop: TourStop) => {
    const map = mapRef.current;
    if (!map || !stop.storyId) {
      return;
    }
    touringRef.current = true;
    setActiveId(stop.storyId);
    setTourCard(null);
    const end = startTourPath(map, greatCircle(from, { lng: stop.lng, lat: stop.lat }));
    if (!end) {
      return;
    }
    map.easeTo({
      center: [end.lng, end.lat],
      zoom: COUNTRY_ZOOM,
      pitch: 0,
      bearing: 0,
      duration: TOUR_FLY_MS,
      essential: true,
      easing: (t) => t,
    });
    afterEase(TOUR_FLY_MS, () => {
      if (token !== tourToken.current) {
        return;
      }
      setTourCard(stop);
      holdRef.current = window.setTimeout(() => {
        if (token !== tourToken.current) {
          return;
        }
        setTourCard(null);
        flyHomeToSomalia(token, { lng: stop.lng, lat: stop.lat }, () => {
          if (token !== tourToken.current) {
            return;
          }
          const list = eventsRef.current;
          const index = list.findIndex((item) => item.storyId === stop.storyId);
          const nextIndex = directionRef.current > 0
            ? nextTourIndex(index, list.length)
            : prevTourIndex(Math.max(index, 0));
          const next = nextIndex === index ? null : list[nextIndex];
          if (!next) {
            touringRef.current = false;
            clearTourPath(mapRef.current);
            return;
          }
          flyToStop(token, iceOffice, next);
        });
      }, PIN_HOLD_MS);
    });
  };

  const runPlaceTour = (stop: TourStop, direction = 1) => {
    const map = mapRef.current;
    if (!map || !stop.storyId) {
      return;
    }
    const token = tourToken.current + 1;
    tourToken.current = token;
    stopMotion();
    directionRef.current = direction;
    setTourCard(null);
    flyToStop(token, iceOffice, stop);
  };

  const stepEvent = (delta: number) => {
    if (events.length === 0) {
      return;
    }
    const index = events.findIndex((stop) => stop.storyId === activeId);
    const fromIndex = index < 0 ? (delta > 0 ? -1 : 0) : index;
    const nextIndex = delta > 0 ? nextTourIndex(fromIndex, events.length) : prevTourIndex(Math.max(fromIndex, 0));
    const stop = events[nextIndex];
    if (stop) {
      runPlaceTour(stop, delta);
    }
  };

  const goHome = () => {
    const map = mapRef.current;
    tourToken.current += 1;
    stopMotion();
    touringRef.current = false;
    setTourCard(null);
    setActiveId(null);
    setSearchOpen(false);
    setMeasuring(false);
    measurePointsRef.current = [];
    setMeasureKm(null);
    const measure = map?.getSource('measure-line') as GeoJSONSource | undefined;
    measure?.setData(emptyLine);
    clearTourPath(map);
    map?.easeTo({
      center: [iceOffice.lng, iceOffice.lat],
      zoom: COUNTRY_ZOOM,
      pitch: 0,
      bearing: 0,
      duration: 2800,
    });
  };

  const resetCompass = () => {
    mapRef.current?.easeTo({
      bearing: 0,
      pitch: 0,
      duration: 700,
    });
  };

  const toggleMeasure = () => {
    const next = !measuring;
    setMeasuring(next);
    setSearchOpen(false);
    if (!next) {
      measurePointsRef.current = [];
      setMeasureKm(null);
      const source = mapRef.current?.getSource('measure-line') as GeoJSONSource | undefined;
      source?.setData(emptyLine);
    }
  };

  useEffect(() => {
    measuringRef.current = measuring;
  }, [measuring]);

  useEffect(() => {
    if (!host.current) {
      return;
    }
    const map = new Map({
      container: host.current,
      style: styleForLayer('osm'),
      center: [MOGADISHU_HOME.lng, MOGADISHU_HOME.lat],
      zoom: COUNTRY_ZOOM,
      pitch: GLOBE_VIEW.pitch,
      bearing: GLOBE_VIEW.bearing,
      minZoom: GLOBE_VIEW.minZoom,
      maxZoom: GLOBE_VIEW.maxZoom,
      maxPitch: 0,
      fadeDuration: 0,
      refreshExpiredTiles: false,
      attributionControl: false,
    });
    map.setPadding(STAGE_PADDING);
    map.addControl(new NavigationControl({ visualizePitch: false, showCompass: false }), 'top-right');
    map.addControl(new AttributionControl({ compact: true }), 'bottom-left');
    mapRef.current = map;
    const onLoad = () => {
      applyFlatMap(map);
      if (!map.getSource('measure-line')) {
        map.addSource('measure-line', { type: 'geojson', data: emptyLine });
        map.addLayer({
          id: 'measure-line',
          type: 'line',
          source: 'measure-line',
          paint: { 'line-color': '#4CAF7D', 'line-width': 3 },
        });
      }
      if (!map.getSource('tour-path')) {
        map.addSource('tour-path', { type: 'geojson', data: emptyLine });
        map.addLayer({
          id: 'tour-path',
          type: 'line',
          source: 'tour-path',
          paint: { 'line-color': '#4CAF7D', 'line-width': 3, 'line-opacity': 0.85 },
        });
      }
      map.resize();
      showAllPins(map);
    };
    const onClick = (event: { lngLat: { lng: number; lat: number } }) => {
      if (!measuringRef.current) {
        return;
      }
      const point = { lng: event.lngLat.lng, lat: event.lngLat.lat };
      const previous = measurePointsRef.current;
      const next = previous.length >= 2 ? [point] : [...previous, point];
      measurePointsRef.current = next;
      const source = map.getSource('measure-line') as GeoJSONSource | undefined;
      source?.setData(lineData(next));
      setMeasureKm(next.length === 2 ? distanceKm(next[0], next[1]) : null);
    };
    map.on('load', onLoad);
    map.on('click', onClick);
    const fitScreen = () => map.resize();
    window.addEventListener('resize', fitScreen);
    return () => {
      window.removeEventListener('resize', fitScreen);
      tourToken.current += 1;
      stopMotion();
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      homeMarkerRef.current?.remove();
      homeMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <section className="global-stage" aria-label="ICE Institute at Global Stage">
      <div className="global-stage-scene">
        <div className="global-stage-map" ref={host} />
        <h1 className="tour-title">ICE Institute at Global Stage</h1>
        <button type="button" className="tour-back simple" aria-label="Back to main" onClick={onClose}>
          Back to main
        </button>
        <div className="tour-icon-bar simple">
          <div className="tour-layer-wrap">
            <button
              type="button"
              aria-label="Search tour"
              aria-pressed={searchOpen}
              onClick={() => {
                setSearchOpen((open) => !open);
                setMeasuring(false);
              }}
            >
              <SearchIcon />
            </button>
            {searchOpen ? (
              <div className="tour-search-panel">
                <input
                  className="tour-search-input"
                  value={searchQuery}
                  placeholder="Search country or event..."
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
                {searchHits.map((hit) => (
                  <button
                    key={hit.storyId}
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      runPlaceTour(hit);
                    }}
                  >
                    {hit.country}: {hit.title}
                  </button>
                ))}
                {searchHits.length === 0 ? <p>No matches</p> : null}
              </div>
            ) : null}
          </div>
          <button type="button" aria-label="Go home" onClick={goHome}>
            <HomeIcon />
          </button>
          <button type="button" aria-label="Measure distance" aria-pressed={measuring} onClick={toggleMeasure}>
            <MeasureIcon />
          </button>
          <button type="button" aria-label="Reset compass" onClick={resetCompass}>
            <CompassIcon />
          </button>
        </div>
        <div className="tour-event-nav">
          <button type="button" aria-label="Back" onClick={() => stepEvent(-1)}>
            Back
          </button>
          <button type="button" aria-label="Next" onClick={() => stepEvent(1)}>
            Next
          </button>
        </div>
        {measureKm !== null ? <p className="tour-measure-badge">{Math.round(measureKm)} km</p> : null}
        <div className="tour-left-stack">
          <ContinentSummaryCards
            cards={summaries}
            total={visitTotal}
            activeContinent={activeContinent}
            activeTotal={!activeContinent}
            onContinent={(continent) => {
              const stop = tour[firstEventIndexByContinent(tour, continent)];
              if (stop?.kind === 'event') {
                runPlaceTour(stop);
              }
            }}
            onTotal={goHome}
          />
        </div>
        {tourCard ? (
          <div className="tour-right-stack">
            <aside className="event-slider">
            <article className="event-card active" aria-label="Tour event">
              <button
                type="button"
                className="event-card-close"
                aria-label="Close event"
                onClick={() => {
                  tourToken.current += 1;
                  stopMotion();
                  touringRef.current = false;
                  setTourCard(null);
                }}
              >
                ×
              </button>
              {tourCard.images[0] ? <img src={tourCard.images[0]} alt="" /> : null}
              <p className="event-card-date">{formatTourDate(tourCard.date)}</p>
              <h3>{tourCard.title}</h3>
              <p className="event-card-place">
                {tourCard.place} · {tourCard.country}
              </p>
              <p>{tourCard.summary}</p>
              {tourCard.website ? (
                <p className="event-card-more">
                  <strong>More information:</strong>{' '}
                  <a href={tourCard.website} target="_blank" rel="noreferrer">
                    {tourCard.website}
                  </a>
                </p>
              ) : null}
            </article>
            </aside>
          </div>
        ) : null}
      </div>
    </section>
  );
}
