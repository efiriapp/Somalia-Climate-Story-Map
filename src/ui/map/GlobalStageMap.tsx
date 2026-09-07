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
  ICE_OFFICE_LABEL,
  ICE_OFFICE_LOGO,
  MOGADISHU_HOME,
  SOMALIA_HOME,
  nextTourIndex,
  prevTourIndex,
  type TourStop,
} from '../../application/global-tour';
import { countryLabel, formatLocaleDate } from '../../application/locale';
import { styleForLayer } from '../../application/map-layers';
import { storyMediaCredit } from '../../application/media-source-credit';
import { flagIconUrl } from '../../application/country-flag';
import type { Story } from '../../domain/story';
import { MediaSourceCredit } from '../catalog/MediaSourceCredit';
import { useLocale } from '../chrome/LocaleContext';
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
const JUMP_MS = 1800;
const LAND_MS = 1600;
const ORIGIN_HOLD_MS = 900;
const OVERVIEW_ZOOM = 3;
const HOME_HOLD_MS = 4000;
const HOME_PIN = '#063D39';
const EVENT_PIN = '#2E7D57';
const ACTIVE_PIN = '#C62828';
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

const storyJumpFromSomalia = (map: Map, to: LngLat, onDone: () => void) => {
  map.stop();
  map.jumpTo({
    center: [SOMALIA_HOME.lng, SOMALIA_HOME.lat],
    zoom: COUNTRY_ZOOM,
    pitch: 0,
    bearing: 0,
  });
  afterEase(ORIGIN_HOLD_MS, () => {
    map.flyTo({
      center: [to.lng, to.lat],
      zoom: OVERVIEW_ZOOM,
      pitch: 0,
      bearing: 0,
      duration: JUMP_MS,
      curve: 1.8,
      essential: true,
    });
    afterEase(JUMP_MS, () => {
      map.easeTo({
        center: [to.lng, to.lat],
        zoom: COUNTRY_ZOOM,
        pitch: 0,
        bearing: 0,
        duration: LAND_MS,
        essential: true,
      });
      afterEase(LAND_MS, onDone);
    });
  });
};

export function GlobalStageMap({ stories, onClose }: Props) {
  const { copy, locale } = useLocale();
  const localeRef = useRef(locale);
  const copyRef = useRef(copy);
  localeRef.current = locale;
  copyRef.current = copy;
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

  const showAllPins = (map: Map, activeId: string | null = null) => {
    hidePins();
    homeMarkerRef.current = new Marker({ color: activeId === 'home' ? ACTIVE_PIN : HOME_PIN })
      .setLngLat([MOGADISHU_HOME.lng, MOGADISHU_HOME.lat])
      .addTo(map);
    const homePin = homeMarkerRef.current.getElement();
    const office = document.createElement('span');
    office.className = 'ice-office-label';
    office.textContent = localeRef.current === 'en' ? ICE_OFFICE_LABEL : copyRef.current.iceOfficeLabel;
    const logo = document.createElement('img');
    logo.className = 'ice-office-logo';
    logo.src = ICE_OFFICE_LOGO;
    logo.alt = '';
    logo.width = 20;
    logo.height = 15;
    office.prepend(logo);
    homePin.appendChild(office);
    const pins: Marker[] = [];
    for (const stop of eventsRef.current) {
      const marker = new Marker({ color: stop.storyId === activeId ? ACTIVE_PIN : EVENT_PIN })
        .setLngLat([stop.lng, stop.lat])
        .addTo(map);
      const pin = marker.getElement();
      pin.style.cursor = 'pointer';
      if (touringRef.current && stop.storyId === activeId) {
        const label = document.createElement('span');
        label.className = 'pin-date-label';
        const flagUrl = flagIconUrl(stop.country);
        if (flagUrl) {
          const flag = document.createElement('img');
          flag.className = 'pin-flag-icon';
          flag.src = flagUrl;
          flag.alt = '';
          flag.width = 48;
          flag.height = 36;
          label.appendChild(flag);
        }
        const date = document.createElement('span');
        date.className = 'pin-date-text';
        date.textContent = formatLocaleDate(stop.date, localeRef.current);
        label.appendChild(date);
        pin.appendChild(label);
      }
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
    showAllPins(map, stop.storyId);
    map.easeTo({
      center: [stop.lng, stop.lat],
      zoom: COUNTRY_ZOOM,
      pitch: 0,
      bearing: 0,
      duration: JUMP_MS,
      essential: true,
    });
  };
  openStopRef.current = openStop;

  const iceOffice = { lng: MOGADISHU_HOME.lng, lat: MOGADISHU_HOME.lat };

  const flyHomeToSomalia = (token: number, from: LngLat, onArrive: () => void) => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    showAllPins(map, 'home');
    setTourCard(null);
    const end = startTourPath(map, greatCircle(from, iceOffice));
    if (!end) {
      onArrive();
      return;
    }
    map.flyTo({
      center: [SOMALIA_HOME.lng, SOMALIA_HOME.lat],
      zoom: OVERVIEW_ZOOM,
      pitch: 0,
      bearing: 0,
      duration: JUMP_MS,
      curve: 1.8,
      essential: true,
    });
    afterEase(JUMP_MS, () => {
      if (token !== tourToken.current) {
        return;
      }
      map.easeTo({
        center: [SOMALIA_HOME.lng, SOMALIA_HOME.lat],
        zoom: COUNTRY_ZOOM,
        pitch: 0,
        bearing: 0,
        duration: LAND_MS,
        essential: true,
      });
      afterEase(LAND_MS, () => {
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
    showAllPins(map, stop.storyId);
    const end = startTourPath(
      map,
      greatCircle({ lng: SOMALIA_HOME.lng, lat: SOMALIA_HOME.lat }, { lng: stop.lng, lat: stop.lat }),
    );
    if (!end) {
      return;
    }
    storyJumpFromSomalia(map, end, () => {
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
            if (mapRef.current) {
              showAllPins(mapRef.current);
            }
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
    if (map) {
      showAllPins(map);
    }
    map?.easeTo({
      center: [SOMALIA_HOME.lng, SOMALIA_HOME.lat],
      zoom: COUNTRY_ZOOM,
      pitch: 0,
      bearing: 0,
      duration: JUMP_MS,
      essential: true,
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
      center: [SOMALIA_HOME.lng, SOMALIA_HOME.lat],
      zoom: COUNTRY_ZOOM,
      pitch: GLOBE_VIEW.pitch,
      bearing: GLOBE_VIEW.bearing,
      minZoom: GLOBE_VIEW.minZoom,
      maxZoom: GLOBE_VIEW.maxZoom,
      maxPitch: 0,
      fadeDuration: 300,
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
          paint: { 'line-color': '#4CAF7D', 'line-width': 5, 'line-opacity': 0.9 },
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
    <section className="global-stage" aria-label={copy.globalStageTitle}>
      <div className="global-stage-scene">
        <div className="global-stage-map" ref={host} />
        <h1 className="tour-title">{copy.globalStageTitle}</h1>
        <button type="button" className="tour-back simple" aria-label={copy.backToMain} onClick={onClose}>
          {copy.backToMain}
        </button>
        <div className="tour-icon-bar simple">
          <div className="tour-layer-wrap">
            <button
              type="button"
              aria-label={copy.searchTour}
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
                  placeholder={copy.searchCountryOrEvent}
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
                    {countryLabel(hit.country, locale)}: {hit.title}
                  </button>
                ))}
                {searchHits.length === 0 ? <p>{copy.noMatches}</p> : null}
              </div>
            ) : null}
          </div>
          <button type="button" aria-label={copy.goHome} onClick={goHome}>
            <HomeIcon />
          </button>
          <button type="button" aria-label={copy.measureDistance} aria-pressed={measuring} onClick={toggleMeasure}>
            <MeasureIcon />
          </button>
          <button type="button" aria-label={copy.resetCompass} onClick={resetCompass}>
            <CompassIcon />
          </button>
        </div>
        <div className="tour-event-nav">
          <button type="button" aria-label={copy.tourBack} onClick={() => stepEvent(-1)}>
            {copy.tourBack}
          </button>
          <button type="button" aria-label={copy.tourNext} onClick={() => stepEvent(1)}>
            {copy.tourNext}
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
            <article className="event-card active" aria-label={copy.tourEvent}>
              <button
                type="button"
                className="event-card-close"
                aria-label={copy.closeEvent}
                onClick={() => {
                  tourToken.current += 1;
                  stopMotion();
                  touringRef.current = false;
                  setTourCard(null);
                  if (mapRef.current) {
                    showAllPins(mapRef.current);
                  }
                }}
              >
                ×
              </button>
              {tourCard.images[0] ? <img src={tourCard.images[0]} alt="" /> : null}
              <p className="event-card-date">{formatLocaleDate(tourCard.date, locale)}</p>
              <h3>{tourCard.kind === 'home' ? copy.mogadishuHome : tourCard.title}</h3>
              <p className="event-card-place">
                {tourCard.kind === 'home' ? copy.mogadishuHome : tourCard.place} · {countryLabel(tourCard.country, locale)}
              </p>
              <p>{tourCard.kind === 'home' ? copy.iceHomeSummary : tourCard.summary}</p>
              {tourCard.website ? (
                <p className="event-card-more">
                  <strong>{copy.moreInfo}</strong>{' '}
                  <a href={tourCard.website} target="_blank" rel="noreferrer">
                    {tourCard.website}
                  </a>
                </p>
              ) : null}
              <MediaSourceCredit credit={storyMediaCredit(tourCard)} />
            </article>
            </aside>
          </div>
        ) : null}
      </div>
    </section>
  );
}
