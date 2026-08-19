import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AttributionControl, Map, Marker, NavigationControl, Popup, type GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { searchTourStops } from '../../application/continent-visits';
import {
  CRUISE_ZOOM,
  PLACE_FLY_MS,
  PLACE_ZOOM,
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

const labeledPin = (color: string, title: string) => {
  const root = document.createElement('div');
  root.className = 'tour-pin';
  const dot = document.createElement('span');
  dot.className = 'tour-pin-dot';
  dot.style.background = color;
  const label = document.createElement('span');
  label.className = 'tour-pin-label';
  label.textContent = title;
  root.append(dot, label);
  return root;
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
    () => buildGlobalTour(stories).filter((stop) => stop.kind === 'event'),
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

  const flyHome = (token: number) => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    setTourCard(null);
    const from = { lng: map.getCenter().lng, lat: map.getCenter().lat };
    const home = { lng: GLOBE_VIEW.lng, lat: GLOBE_VIEW.lat };
    flyAlong(map, greatCircle(from, home), GLOBE_VIEW.zoom, GLOBE_VIEW.pitch, (id) => {
      rafRef.current = id;
    }, () => {
      if (token !== tourToken.current) {
        return;
      }
      clearTourPath(map);
      touringRef.current = false;
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
    flyAlong(map, greatCircle(from, { lng: stop.lng, lat: stop.lat }), PLACE_ZOOM, 28, (id) => {
      rafRef.current = id;
    }, () => {
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
        if (nextIndex === index) {
          flyHome(token);
          return;
        }
        const next = list[nextIndex];
        if (!next) {
          flyHome(token);
          return;
        }
        flyToStop(token, { lng: stop.lng, lat: stop.lat }, next);
      }, POPUP_HOLD_MS);
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
      homeMarkerRef.current = new Marker({ element: labeledPin('#063D39', MOGADISHU_HOME.title), anchor: 'bottom' })
        .setLngLat([MOGADISHU_HOME.lng, MOGADISHU_HOME.lat])
        .addTo(map);
    }
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = events.map((stop) => {
      const marker = new Marker({ element: labeledPin('#2E7D57', stop.title), anchor: 'bottom' })
        .setLngLat([stop.lng, stop.lat])
        .addTo(map);
      const pin = marker.getElement();
      pin.style.cursor = 'pointer';
      const open = (event: Event) => {
        event.stopPropagation();
        if (measuringRef.current || touringRef.current || !stop.storyId) {
          return;
        }
        setActiveId(stop.storyId);
        showPinPopup(map, stop);
      };
      pin.addEventListener('click', open);
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
