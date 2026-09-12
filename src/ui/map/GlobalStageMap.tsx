import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AttributionControl, Map, Marker, NavigationControl, type GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  continentOfCountry,
  continentSummaries,
  defaultTourFilter,
  firstEventIndexByContinent,
  summaryTotal,
} from '../../application/continent-visits';
import {
  distanceKm,
  pathCoordinates,
  type LngLat,
} from '../../application/flight-path';
import {
  buildGlobalTour,
  GLOBE_VIEW,
  CITY_ZOOM,
  COUNTRY_ZOOM,
  ICE_OFFICE_LABEL,
  ICE_OFFICE_LOGO,
  MOGADISHU_HOME,
  SOMALIA_HOME,
  nextTourIndex,
  prevTourIndex,
  type TourStop,
} from '../../application/global-tour';
import { EqualEarthCoordTransform } from 'maplibre-gl-equal-earth';
import {
  EQUAL_EARTH_SWITCH_ZOOM,
  equalEarthStyle,
} from '../../application/equal-earth';
import { countryLabel, formatLocaleDate } from '../../application/locale';
import { DEFAULT_MAP_LAYER, type MapLayerId } from '../../application/map-layers';
import { storyMediaCredit } from '../../application/media-source-credit';
import { flagIconUrl } from '../../application/country-flag';
import type { Story } from '../../domain/story';
import { MediaSourceCredit } from '../catalog/MediaSourceCredit';
import { AutoplayScroll } from '../chrome/AutoplayScroll';
import { useOptionalAutoplay } from '../chrome/AutoplayContext';
import { useLocale } from '../chrome/LocaleContext';
import { ContinentSummaryCards } from './ContinentSummaryCards';
import { MapBasemapControl } from './MapBasemapControl';

type Props = {
  stories: Story[];
  onClose: () => void;
};

const Icon = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    {children}
  </svg>
);

const RestartIcon = () => (
  <Icon>
    <path d="M20 11a8 8 0 1 1-2.35-5.65" />
    <path d="M20 4v7h-7" />
  </Icon>
);

const MeasureIcon = () => (
  <Icon>
    <path d="M4 8h16v8H4z" />
    <path d="M7 8v4M10 8v3M13 8v4M16 8v3" />
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
const STAGE_PADDING = { top: 120, bottom: 80, left: 148, right: 332 };
let flyTimer = 0;

const emptyLine: GeoJSON.Feature = {
  type: 'Feature',
  properties: {},
  geometry: { type: 'LineString', coordinates: [] },
};

const ensureMeasureLine = (map: Map) => {
  if (map.getSource('measure-line')) {
    return;
  }
  map.addSource('measure-line', { type: 'geojson', data: emptyLine });
  map.addLayer({
    id: 'measure-line',
    type: 'line',
    source: 'measure-line',
    paint: { 'line-color': '#4CAF7D', 'line-width': 3 },
  });
};

const lineData = (path: LngLat[]): GeoJSON.Feature => ({
  type: 'Feature',
  properties: {},
  geometry: { type: 'LineString', coordinates: pathCoordinates(path) },
});

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
        zoom: CITY_ZOOM,
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
  const autoplay = useOptionalAutoplay();
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
  const autoplayDriveRef = useRef(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [layersOpen, setLayersOpen] = useState(false);
  const [basemap, setBasemap] = useState<MapLayerId>(DEFAULT_MAP_LAYER);
  const [measuring, setMeasuring] = useState(false);
  const [measureKm, setMeasureKm] = useState<number | null>(null);
  const [tourCard, setTourCard] = useState<TourStop | null>(null);
  const basemapReady = useRef(false);
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
  const activeStop = events.find((stop) => stop.storyId === activeId);
  const activeContinent = activeStop ? continentOfCountry(activeStop.country) : undefined;

  const pauseAutoplay = () => {
    autoplayDriveRef.current = false;
    autoplay?.setMapDriving(false);
    autoplay?.pause();
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

  /** Pins on/off: all locations when idle; only the tour destination while touring. */
  const showAllPins = (map: Map, activeId: string | null = null) => {
    hidePins();
    const tourWorking = touringRef.current;
    const focusEvent = Boolean(activeId && activeId !== 'home');
    const focusHome = activeId === 'home';
    // During an active tour, never show the full pin set — destination only (or none on home hop).
    if (tourWorking && focusHome) {
      return;
    }
    if (tourWorking && !focusEvent) {
      return;
    }

    if (!focusEvent) {
      homeMarkerRef.current = new Marker({ color: focusHome ? ACTIVE_PIN : HOME_PIN })
        .setLngLat([MOGADISHU_HOME.lng, MOGADISHU_HOME.lat])
        .addTo(map);
      const homePin = homeMarkerRef.current.getElement();
      const office = document.createElement('span');
      office.className = 'ice-office-label';
      const logo = document.createElement('img');
      logo.className = 'ice-office-logo';
      logo.src = ICE_OFFICE_LOGO;
      logo.alt = '';
      logo.width = 48;
      logo.height = 36;
      office.appendChild(logo);
      const officeText = document.createElement('span');
      officeText.className = 'ice-office-text';
      officeText.textContent =
        localeRef.current === 'en' ? ICE_OFFICE_LABEL : copyRef.current.iceOfficeLabel;
      office.appendChild(officeText);
      homePin.appendChild(office);
    }

    const pins: Marker[] = [];
    for (const stop of eventsRef.current) {
      if (focusHome) {
        continue;
      }
      if (focusEvent && stop.storyId !== activeId) {
        continue;
      }
      const marker = new Marker({ color: stop.storyId === activeId ? ACTIVE_PIN : EVENT_PIN })
        .setLngLat([stop.lng, stop.lat])
        .addTo(map);
      const pin = marker.getElement();
      pin.style.cursor = 'pointer';
      if (tourWorking && stop.storyId === activeId) {
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

  const resetPinsOn = (map: Map) => {
    touringRef.current = false;
    showAllPins(map);
  };

  const openStop = (stop: TourStop) => {
    if (!stop.storyId) {
      return;
    }
    pauseAutoplay();
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
      zoom: CITY_ZOOM,
      pitch: 0,
      bearing: 0,
      duration: JUMP_MS,
      essential: true,
    });
  };
  openStopRef.current = openStop;

  const iceOffice = { lng: MOGADISHU_HOME.lng, lat: MOGADISHU_HOME.lat };

  const flyHomeToSomalia = (token: number, _from: LngLat, onArrive: () => void) => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    // Tour in progress: hide location pins while returning to Somalia.
    hidePins();
    setTourCard(null);
    map.stop();
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

  const flyToStop = (token: number, _from: LngLat, stop: TourStop) => {
    const map = mapRef.current;
    if (!map || !stop.storyId) {
      return;
    }
    touringRef.current = true;
    setActiveId(stop.storyId);
    setTourCard(null);
    // Tour working: show only the destination pin (hide every other location).
    showAllPins(map, stop.storyId);
    map.stop();
    storyJumpFromSomalia(map, { lng: stop.lng, lat: stop.lat }, () => {
      if (token !== tourToken.current) {
        return;
      }
      showAllPins(map, stop.storyId);
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
            // Tour reset: turn all location pins back on.
            if (mapRef.current) {
              resetPinsOn(mapRef.current);
            }
            if (autoplayDriveRef.current) {
              autoplayDriveRef.current = false;
              autoplay?.setMapDriving(false);
              autoplay?.pause();
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
    pauseAutoplay();
    const index = events.findIndex((stop) => stop.storyId === activeId);
    const fromIndex = index < 0 ? (delta > 0 ? -1 : 0) : index;
    const nextIndex = delta > 0 ? nextTourIndex(fromIndex, events.length) : prevTourIndex(Math.max(fromIndex, 0));
    const stop = events[nextIndex];
    if (stop) {
      runPlaceTour(stop, delta);
    }
  };

  const goHome = () => {
    pauseAutoplay();
    const map = mapRef.current;
    tourToken.current += 1;
    stopMotion();
    setTourCard(null);
    setActiveId(null);
    setMeasuring(false);
    measurePointsRef.current = [];
    setMeasureKm(null);
    const measure = map?.getSource('measure-line') as GeoJSONSource | undefined;
    measure?.setData(emptyLine);
    if (map) {
      resetPinsOn(map);
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

  const toggleMeasure = () => {
    const next = !measuring;
    setMeasuring(next);
    setLayersOpen(false);
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
    if (!autoplay) return;
    if (!autoplay.playing || autoplay.reducedMotion) {
      if (autoplayDriveRef.current) {
        autoplayDriveRef.current = false;
        autoplay.setMapDriving(false);
        tourToken.current += 1;
        stopMotion();
      }
      return;
    }
    if (events.length === 0) return;
    autoplayDriveRef.current = true;
    autoplay.setMapDriving(true);
    const current = events.find((stop) => stop.storyId === activeId) ?? events[0];
    if (current) {
      runPlaceTour(current, 1);
    }
    // Intentionally start once when play begins; tour chain advances itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay?.playing, autoplay?.reducedMotion]);

  useEffect(() => {
    if (!host.current) {
      return;
    }
    const map = new Map({
      container: host.current,
      style: equalEarthStyle(DEFAULT_MAP_LAYER),
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
    new EqualEarthCoordTransform(map, EQUAL_EARTH_SWITCH_ZOOM);
    mapRef.current = map;
    basemapReady.current = false;
    const onLoad = () => {
      ensureMeasureLine(map);
      basemapReady.current = true;
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

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !basemapReady.current) {
      return;
    }
    const activeIdSnapshot = activeId;
    map.setStyle(equalEarthStyle(basemap));
    map.once('style.load', () => {
      ensureMeasureLine(map);
      const source = map.getSource('measure-line') as GeoJSONSource | undefined;
      source?.setData(lineData(measurePointsRef.current));
      showAllPins(map, activeIdSnapshot);
    });
  }, [basemap]);

  return (
    <section className="global-stage" aria-label={copy.globalStageTitle}>
      <AutoplayScroll />
      <div className="global-stage-scene">
        <div className="global-stage-map" ref={host} />
        <h1 className="tour-title">{copy.globalStageTitle}</h1>
        <button type="button" className="tour-back simple" aria-label={copy.backToMain} onClick={onClose}>
          {copy.backToMain}
        </button>
        <div className="tour-icon-bar simple">
          <MapBasemapControl
            value={basemap}
            open={layersOpen}
            onOpenChange={(open) => {
              setLayersOpen(open);
              if (open) setMeasuring(false);
            }}
            onChange={setBasemap}
          />
          <button type="button" aria-label={copy.tourRestart} onClick={goHome}>
            <RestartIcon />
          </button>
          <button type="button" aria-label={copy.measureDistance} aria-pressed={measuring} onClick={toggleMeasure}>
            <MeasureIcon />
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
              pauseAutoplay();
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
                  pauseAutoplay();
                  tourToken.current += 1;
                  stopMotion();
                  setTourCard(null);
                  setActiveId(null);
                  if (mapRef.current) {
                    resetPinsOn(mapRef.current);
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
