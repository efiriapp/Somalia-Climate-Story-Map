import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AttributionControl, Map, Marker, NavigationControl, Popup, type GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { searchTourStops } from '../../application/continent-visits';
import {
  CITY_EASE_MS,
  CRUISE_ZOOM,
  PLACE_FLY_MS,
  POPUP_HOLD_MS,
  cruiseThenArrive,
  distanceKm,
  greatCircle,
  pathCoordinates,
  pointAlong,
  slicePath,
  type LngLat,
} from '../../application/flight-path';
import {
  buildGlobalTour,
  GLOBE_PADDING,
  GLOBE_VIEW,
  CITY_ZOOM,
  COUNTRY_ZOOM,
  MOGADISHU_HOME,
  formatTourDate,
  nextTourIndex,
  prevTourIndex,
  tourPopupHtml,
  type TourStop,
} from '../../application/global-tour';
import { styleForLayer } from '../../application/map-layers';
import type { Story } from '../../domain/story';

type Props = {
  stories: Story[];
  onClose: () => void;
};

const applyGlobe = (map: Map) => {
  const globeMap = map as Map & { setProjection?: (projection: { type: string }) => void };
  globeMap.setProjection?.({ type: 'globe' });
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

const flyAlong = (
  map: Map,
  path: LngLat[],
  endZoom: number,
  endPitch: number,
  setRaf: (id: number) => void,
  onDone: () => void,
) => {
  const startZoom = map.getZoom();
  const startPitch = map.getPitch();
  const started = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - started) / PLACE_FLY_MS);
    const point = pointAlong(path, t);
    const source = map.getSource('tour-path') as GeoJSONSource | undefined;
    source?.setData(lineData(slicePath(path, t)));
    map.jumpTo({
      center: [point.lng, point.lat],
      zoom: cruiseThenArrive(t, startZoom, CRUISE_ZOOM, endZoom),
      pitch: startPitch + (endPitch - startPitch) * t,
      bearing: map.getBearing(),
    });
    if (t < 1) {
      setRaf(requestAnimationFrame(step));
    } else {
      onDone();
    }
  };
  setRaf(requestAnimationFrame(step));
};

export function GlobalStageMap({ stories, onClose }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const homeMarkerRef = useRef<Marker | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const measuringRef = useRef(false);
  const measurePointsRef = useRef<LngLat[]>([]);
  const touringRef = useRef(false);
  const tourToken = useRef(0);
  const rafRef = useRef(0);
  const holdRef = useRef(0);
  const [ready, setReady] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [measuring, setMeasuring] = useState(false);
  const [measureKm, setMeasureKm] = useState<number | null>(null);
  const [tourCard, setTourCard] = useState<TourStop | null>(null);
  const events = useMemo(
    () =>
      buildGlobalTour(stories)
        .filter((stop) => stop.kind === 'event')
        .sort((a, b) => a.date.localeCompare(b.date)),
    [stories],
  );
  const eventsRef = useRef(events);
  eventsRef.current = events;
  const directionRef = useRef(1);
  const searchHits = useMemo(() => searchTourStops(events, searchQuery), [events, searchQuery]);

  const clearPopup = () => {
    popupRef.current?.remove();
    popupRef.current = null;
  };

  const clearTourPath = (map: Map | null) => {
    const source = map?.getSource('tour-path') as GeoJSONSource | undefined;
    source?.setData(emptyLine);
  };

  const stopMotion = () => {
    cancelAnimationFrame(rafRef.current);
    window.clearTimeout(holdRef.current);
  };

  const showPinPopup = (map: Map, stop: TourStop) => {
    const html = tourPopupHtml(stop);
    clearPopup();
    if (!html) {
      return;
    }
    popupRef.current = new Popup({
      closeButton: true,
      closeOnClick: false,
      maxWidth: '200px',
      offset: 22,
      className: 'tour-map-popup',
    })
      .setLngLat([stop.lng, stop.lat])
      .setHTML(html)
      .addTo(map);
  };

  const iceOffice = { lng: MOGADISHU_HOME.lng, lat: MOGADISHU_HOME.lat };

  const landAtIceOffice = (map: Map, onDone: () => void) => {
    map.easeTo({
      center: [iceOffice.lng, iceOffice.lat],
      zoom: COUNTRY_ZOOM,
      pitch: 24,
      bearing: 0,
      duration: CITY_EASE_MS,
    });
    holdRef.current = window.setTimeout(onDone, CITY_EASE_MS);
  };

  const flyToIceOffice = (token: number, from: LngLat, onArrive: () => void) => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    setTourCard(null);
    flyAlong(map, greatCircle(from, iceOffice), CRUISE_ZOOM, 28, (id) => {
      rafRef.current = id;
    }, () => {
      if (token !== tourToken.current) {
        return;
      }
      landAtIceOffice(map, () => {
        if (token !== tourToken.current) {
          return;
        }
        onArrive();
      });
    });
  };

  const flyToStop = (token: number, from: LngLat, stop: TourStop) => {
    const map = mapRef.current;
    if (!map || !stop.storyId) {
      return;
    }
    touringRef.current = true;
    clearPopup();
    setActiveId(stop.storyId);
    flyAlong(map, greatCircle(from, { lng: stop.lng, lat: stop.lat }), CRUISE_ZOOM, 28, (id) => {
      rafRef.current = id;
    }, () => {
      if (token !== tourToken.current) {
        return;
      }
      map.easeTo({
        center: [stop.lng, stop.lat],
        zoom: CITY_ZOOM,
        pitch: 42,
        bearing: 8,
        duration: CITY_EASE_MS,
      });
      holdRef.current = window.setTimeout(() => {
        if (token !== tourToken.current) {
          return;
        }
        setTourCard(stop);
        holdRef.current = window.setTimeout(() => {
          if (token !== tourToken.current) {
            return;
          }
          setTourCard(null);
          const list = eventsRef.current;
          const index = list.findIndex((item) => item.storyId === stop.storyId);
          const nextIndex = directionRef.current > 0
            ? nextTourIndex(index, list.length)
            : prevTourIndex(Math.max(index, 0));
          const next = nextIndex === index ? null : list[nextIndex];
          flyToIceOffice(token, { lng: stop.lng, lat: stop.lat }, () => {
            if (!next) {
              const map = mapRef.current;
              if (map) {
                clearTourPath(map);
              }
              touringRef.current = false;
              return;
            }
            flyToStop(token, iceOffice, next);
          });
        }, POPUP_HOLD_MS);
      }, CITY_EASE_MS);
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
    flyToStop(token, { lng: MOGADISHU_HOME.lng, lat: MOGADISHU_HOME.lat }, stop);
  };

  const stepEvent = (delta: number) => {
    if (events.length === 0) {
      return;
    }
    const index = events.findIndex((stop) => stop.storyId === activeId);
    const from = index < 0 ? (delta > 0 ? -1 : 0) : index;
    const next = delta > 0 ? nextTourIndex(from, events.length) : prevTourIndex(Math.max(from, 0));
    const stop = events[next];
    if (stop) {
      runPlaceTour(stop, delta);
    }
  };

  const goHome = () => {
    const map = mapRef.current;
    tourToken.current += 1;
    stopMotion();
    touringRef.current = false;
    clearPopup();
    setTourCard(null);
    setSearchOpen(false);
    setMeasuring(false);
    measurePointsRef.current = [];
    setMeasureKm(null);
    const measure = map?.getSource('measure-line') as GeoJSONSource | undefined;
    measure?.setData(emptyLine);
    clearTourPath(map);
    map?.easeTo({
      center: [GLOBE_VIEW.lng, GLOBE_VIEW.lat],
      zoom: GLOBE_VIEW.zoom,
      pitch: GLOBE_VIEW.pitch,
      bearing: GLOBE_VIEW.bearing,
      duration: 1200,
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
    mapRef.current?.setPadding({
      ...GLOBE_PADDING,
      right: tourCard ? 332 : GLOBE_PADDING.right,
    });
  }, [tourCard]);

  useEffect(() => {
    if (!host.current) {
      return;
    }
    const map = new Map({
      container: host.current,
      style: styleForLayer('carto-voyager'),
      center: [GLOBE_VIEW.lng, GLOBE_VIEW.lat],
      zoom: GLOBE_VIEW.zoom,
      pitch: GLOBE_VIEW.pitch,
      bearing: GLOBE_VIEW.bearing,
      minZoom: GLOBE_VIEW.minZoom,
      maxZoom: GLOBE_VIEW.maxZoom,
      fadeDuration: 0,
      attributionControl: false,
    });
    map.setPadding(GLOBE_PADDING);
    map.addControl(new NavigationControl({ visualizePitch: true, showCompass: false }), 'top-right');
    map.addControl(new AttributionControl({ compact: true }), 'bottom-left');
    mapRef.current = map;
    const onLoad = () => {
      applyGlobe(map);
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
      setReady(true);
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
      clearPopup();
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
    if (!map || !ready) {
      return;
    }
    if (!homeMarkerRef.current) {
      homeMarkerRef.current = new Marker({ color: '#063D39' })
        .setLngLat([MOGADISHU_HOME.lng, MOGADISHU_HOME.lat])
        .addTo(map);
      const homePin = homeMarkerRef.current.getElement();
      homePin.style.cursor = 'pointer';
      homePin.addEventListener('click', (event) => {
        event.stopPropagation();
        tourToken.current += 1;
        stopMotion();
        touringRef.current = false;
        setTourCard(null);
        clearPopup();
        map.easeTo({
          center: [MOGADISHU_HOME.lng, MOGADISHU_HOME.lat],
          zoom: COUNTRY_ZOOM,
          pitch: 24,
          bearing: 0,
          duration: CITY_EASE_MS,
        });
      });
    }
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = events.map((stop) => {
      const marker = new Marker({ color: '#2E7D57' }).setLngLat([stop.lng, stop.lat]).addTo(map);
      const pin = marker.getElement();
      pin.style.cursor = 'pointer';
      const openFull = (event: Event) => {
        event.stopPropagation();
        if (measuringRef.current || !stop.storyId) {
          return;
        }
        tourToken.current += 1;
        stopMotion();
        touringRef.current = false;
        setTourCard(null);
        setActiveId(stop.storyId);
        map.easeTo({
          center: [stop.lng, stop.lat],
          zoom: CITY_ZOOM,
          pitch: 42,
          bearing: 12,
          duration: CITY_EASE_MS,
        });
        showPinPopup(map, stop);
      };
      const openTitle = () => {
        if (measuringRef.current || touringRef.current || popupRef.current) {
          return;
        }
        popupRef.current = new Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 18,
          className: 'tour-hover-label',
        })
          .setLngLat([stop.lng, stop.lat])
          .setText(stop.title)
          .addTo(map);
      };
      const closeTitle = () => {
        const el = popupRef.current?.getElement();
        if (el?.classList.contains('tour-hover-label')) {
          clearPopup();
        }
      };
      pin.addEventListener('mouseenter', openTitle);
      pin.addEventListener('mouseleave', closeTitle);
      pin.addEventListener('click', openFull);
      return marker;
    });
  }, [events, ready]);

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
        {tourCard ? (
          <div className="tour-right-stack">
            <aside className="event-slider">
            <article className="event-card active" aria-label="Tour event">
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
