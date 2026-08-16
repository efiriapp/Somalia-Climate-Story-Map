import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AttributionControl,
  Map,
  Marker,
  type GeoJSONSource,
  type StyleSpecification,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  CAMERA_MS,
  CITY_EASE_MS,
  CRUISE_PITCH,
  CRUISE_ZOOM,
  FLIGHT_MS,
  FOLLOW_MAX_ZOOM,
  POPUP_DELAY_MS,
  POPUP_HOLD_MS,
  arriveHeading,
  cruiseThenArrive,
  greatCircle,
  pathCoordinates,
  pointAlong,
  type LngLat,
} from '../../application/flight-path';
import { buildGlobalTour, GLOBE_PADDING, GLOBE_VIEW, MOGADISHU_HOME, nextTourIndex, prevTourIndex, tourPopupHtml, type TourStop } from '../../application/global-tour';
import { MAP_LAYERS, styleForLayer, type MapLayerId } from '../../application/map-layers';
import { DateReel } from './DateReel';
import type { Story } from '../../domain/story';

type Props = {
  stories: Story[];
  onClose: () => void;
};

const EMPTY_LINE: GeoJSON.Feature<GeoJSON.LineString> = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'LineString',
    coordinates: [
      [MOGADISHU_HOME.lng, MOGADISHU_HOME.lat],
      [MOGADISHU_HOME.lng + 0.01, MOGADISHU_HOME.lat],
    ],
  },
};

const applyGlobe = (map: Map) => {
  const globeMap = map as Map & { setProjection?: (projection: { type: string }) => void };
  globeMap.setProjection?.({ type: 'globe' });
};

const applyStopView = (map: Map, stop: TourStop) => {
  map.easeTo({
    center: [stop.lng, stop.lat],
    zoom: stop.zoom,
    pitch: stop.pitch,
    bearing: stop.bearing,
    duration: CITY_EASE_MS,
    essential: true,
    padding: stop.kind === 'home' ? GLOBE_PADDING : { top: 88, bottom: 72, left: 32, right: 260 },
  });
};

const createMap = (container: HTMLDivElement, style: StyleSpecification): Map => {
  const map = new Map({
    container,
    style,
    center: [GLOBE_VIEW.lng, GLOBE_VIEW.lat],
    zoom: GLOBE_VIEW.zoom,
    pitch: GLOBE_VIEW.pitch,
    bearing: GLOBE_VIEW.bearing,
    minZoom: GLOBE_VIEW.minZoom,
    maxZoom: GLOBE_VIEW.maxZoom,
    fadeDuration: 0,
    attributionControl: false,
    padding: GLOBE_PADDING,
  });
  map.addControl(new AttributionControl({ compact: true }), 'bottom-left');
  map.on('load', () => {
    applyGlobe(map);
    map.resize();
  });
  return map;
};

const lineFeature = (path: LngLat[]): GeoJSON.Feature<GeoJSON.LineString> => ({
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'LineString',
    coordinates: pathCoordinates(path.length >= 2 ? path : path.concat(path)),
  },
});

const ensureFlightLayers = (map: Map) => {
  if (!map.getSource('flight-history')) {
    map.addSource('flight-history', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
    map.addSource('flight-route', { type: 'geojson', data: EMPTY_LINE, lineMetrics: true });
    map.addSource('flight-progress', { type: 'geojson', data: EMPTY_LINE, lineMetrics: true });
  }
  if (!map.getLayer('flight-history')) {
    map.addLayer({
      id: 'flight-history',
      type: 'line',
      source: 'flight-history',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#4CAF7D',
        'line-width': 3.5,
        'line-opacity': 0.45,
      },
    });
    map.addLayer({
      id: 'flight-route',
      type: 'line',
      source: 'flight-route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#d7ece3',
        'line-width': 4,
        'line-opacity': 0.9,
        'line-dasharray': [2.2, 1.4],
      },
    });
    map.addLayer({
      id: 'flight-progress-case',
      type: 'line',
      source: 'flight-progress',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#063D39',
        'line-width': 10,
        'line-opacity': 0.95,
        'line-trim-offset': [0, 1],
      },
    });
    map.addLayer({
      id: 'flight-progress',
      type: 'line',
      source: 'flight-progress',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#4CAF7D',
        'line-width': 6,
        'line-opacity': 1,
        'line-trim-offset': [0, 1],
      },
    });
  }
};

const setHistory = (map: Map, traces: [number, number][][]) => {
  const source = map.getSource('flight-history') as GeoJSONSource | undefined;
  source?.setData({
    type: 'FeatureCollection',
    features: traces.map((coordinates) => ({
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates },
    })),
  });
};

const setLineData = (map: Map, sourceId: string, path: LngLat[]) => {
  const source = map.getSource(sourceId) as GeoJSONSource | undefined;
  source?.setData(path.length >= 2 ? lineFeature(path) : EMPTY_LINE);
};

const setTravelTrim = (map: Map, traveled: number) => {
  const hidden: [number, number] = [Math.min(Math.max(traveled, 0), 1), 1];
  if (map.getLayer('flight-progress-case')) {
    map.setPaintProperty('flight-progress-case', 'line-trim-offset', hidden);
  }
  if (map.getLayer('flight-progress')) {
    map.setPaintProperty('flight-progress', 'line-trim-offset', hidden);
  }
};

const createPlaneMarker = (): Marker => {
  const el = document.createElement('div');
  el.className = 'tour-plane';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<svg viewBox="0 0 24 24" focusable="false">
    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
  </svg>`;
  return new Marker({
    element: el,
    anchor: 'center',
    rotationAlignment: 'viewport',
    pitchAlignment: 'viewport',
  });
};

const easeInOut = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

const parkPlane = (plane: Marker, at: LngLat, heading: number) => {
  plane.setLngLat([at.lng, at.lat]).setRotation(heading);
};

const followFlight = (
  map: Map,
  plane: Marker,
  path: LngLat[],
  stop: TourStop,
  t: number,
  startZoom: number,
  startPitch: number,
  startBearing: number,
  moveCamera: boolean,
) => {
  const here = pointAlong(path, t);
  parkPlane(plane, here, arriveHeading(path, t));
  setTravelTrim(map, t);
  if (!moveCamera) {
    return;
  }
  map.jumpTo({
    center: [here.lng, here.lat],
    zoom: cruiseThenArrive(t, startZoom, CRUISE_ZOOM, stop.zoom),
    pitch: cruiseThenArrive(t, startPitch, CRUISE_PITCH, stop.pitch),
    bearing: cruiseThenArrive(t, startBearing, GLOBE_VIEW.bearing, stop.bearing),
  });
};

const Icon = ({ d, filled = false }: { d: string; filled?: boolean }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d={d}
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={filled ? undefined : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SkipBackIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M13.6 7.1 6.9 12l6.7 4.9Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinejoin="round"
    />
    <path d="M14.2 12H20" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
  </svg>
);

const SkipForthIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M10.4 7.1 17.1 12l-6.7 4.9Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinejoin="round"
    />
    <path d="M9.8 12H4" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
  </svg>
);

const PlayCircleIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="9.1" fill="none" stroke="currentColor" strokeWidth="2" />
    <path
      d="M10.3 8.5 16.3 12l-6 3.5Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

const PauseCircleIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="9.1" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M9.5 8.6v6.8M14.5 8.6v6.8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

export function GlobalStageMap({ stories, onClose }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const homeMarkerRef = useRef<Marker | null>(null);
  const planeRef = useRef<Marker | null>(null);
  const lastIndexRef = useRef(0);
  const flightRef = useRef(0);
  const popupTimerRef = useRef(0);
  const tracesRef = useRef<[number, number][][]>([]);
  const autoStartedRef = useRef(false);
  const playingRef = useRef(false);
  const playAdvanceRef = useRef(0);
  const flightTickRef = useRef<((now: number) => void) | null>(null);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [layer, setLayer] = useState<MapLayerId>('carto-voyager');
  const tour = useMemo(() => buildGlobalTour(stories), [stories]);
  const stop: TourStop | undefined = tour[index];
  const [calendarDate, setCalendarDate] = useState(tour[0]?.date ?? '2023-01-01');
  playingRef.current = playing;

  const queueNextIfPlaying = (delay: number) => {
    window.clearTimeout(playAdvanceRef.current);
    playAdvanceRef.current = window.setTimeout(() => {
      if (!playingRef.current) {
        return;
      }
      setIndex((current) => {
        const next = nextTourIndex(current, tour.length);
        if (next === current) {
          setPlaying(false);
        }
        return next;
      });
    }, delay);
  };

  useEffect(() => {
    if (!host.current) {
      return;
    }
    const map = createMap(host.current, styleForLayer(layer));
    mapRef.current = map;
    const fitScreen = () => map.resize();
    map.on('load', () => {
      fitScreen();
      setReady(true);
    });
    window.addEventListener('resize', fitScreen);
    return () => {
      window.removeEventListener('resize', fitScreen);
      window.cancelAnimationFrame(flightRef.current);
      window.clearTimeout(popupTimerRef.current);
      window.clearTimeout(playAdvanceRef.current);
      markerRef.current?.remove();
      homeMarkerRef.current?.remove();
      planeRef.current?.remove();
      markerRef.current = null;
      homeMarkerRef.current = null;
      planeRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) {
      return;
    }
    setReady(false);
    map.setStyle(styleForLayer(layer));
    map.once('style.load', () => {
      applyGlobe(map);
      setReady(true);
    });
  }, [layer]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !stop) {
      return;
    }
    ensureFlightLayers(map);
    setHistory(map, tracesRef.current);
    if (!homeMarkerRef.current) {
      homeMarkerRef.current = new Marker({ color: '#063D39' })
        .setLngLat([MOGADISHU_HOME.lng, MOGADISHU_HOME.lat])
        .addTo(map);
    }
    if (!planeRef.current) {
      planeRef.current = createPlaneMarker()
        .setLngLat([MOGADISHU_HOME.lng, MOGADISHU_HOME.lat])
        .addTo(map);
    }
    const plane = planeRef.current;
    markerRef.current?.remove();
    markerRef.current = null;
    if (stop.kind === 'event') {
      markerRef.current = new Marker({ color: '#2E7D57' }).setLngLat([stop.lng, stop.lat]).addTo(map);
    }

    const originStop = tour[lastIndexRef.current] ?? stop;
    const origin: LngLat = { lng: originStop.lng, lat: originStop.lat };
    const dest: LngLat = { lng: stop.lng, lat: stop.lat };
    const moved = origin.lat !== dest.lat || origin.lng !== dest.lng;
    lastIndexRef.current = index;

    map.stop();
    window.cancelAnimationFrame(flightRef.current);
    window.clearTimeout(popupTimerRef.current);
    window.clearTimeout(playAdvanceRef.current);
    setPopupOpen(false);
    const afterArrive = () => {
      if (stop.kind === 'home') {
        setCalendarDate(stop.date);
      }
      if (stop.kind === 'event') {
        popupTimerRef.current = window.setTimeout(() => {
          setPopupOpen(true);
          queueNextIfPlaying(POPUP_HOLD_MS);
        }, CITY_EASE_MS + POPUP_DELAY_MS);
        return;
      }
      if (index > 0) {
        queueNextIfPlaying(CITY_EASE_MS);
      }
    };
    if (!moved) {
      setLineData(map, 'flight-route', []);
      setLineData(map, 'flight-progress', []);
      parkPlane(plane, dest, 12);
      applyStopView(map, stop);
      afterArrive();
      return;
    }

    const path = greatCircle(origin, dest, 96);
    setLineData(map, 'flight-route', path);
    setLineData(map, 'flight-progress', path);
    setTravelTrim(map, 0);
    const startZoom = map.getZoom();
    const startPitch = map.getPitch();
    const startBearing = map.getBearing();
    if (startZoom >= FOLLOW_MAX_ZOOM) {
      map.easeTo({
        center: [origin.lng, origin.lat],
        zoom: CRUISE_ZOOM,
        pitch: CRUISE_PITCH,
        bearing: GLOBE_VIEW.bearing,
        duration: 1200,
        essential: true,
        padding: GLOBE_PADDING,
      });
      parkPlane(plane, origin, arriveHeading(path, 0));
      setTravelTrim(map, 0);
    } else {
      followFlight(map, plane, path, stop, 0, startZoom, startPitch, startBearing, true);
    }
    const started = performance.now();
    let pauseMs = 0;
    let pausedAt = 0;
    let lastCamera = started;
    let cityLocked = false;

    const lockCityView = () => {
      if (cityLocked) {
        return;
      }
      cityLocked = true;
      flightTickRef.current = null;
      window.cancelAnimationFrame(flightRef.current);
      parkPlane(plane, dest, arriveHeading(path, 1));
      setTravelTrim(map, 1);
      tracesRef.current = [...tracesRef.current, pathCoordinates(path)];
      setHistory(map, tracesRef.current);
      applyStopView(map, stop);
      afterArrive();
    };

    const tick = (now: number) => {
      if (!playingRef.current) {
        if (!pausedAt) {
          pausedAt = now;
        }
        flightTickRef.current = tick;
        return;
      }
      if (pausedAt) {
        pauseMs += now - pausedAt;
        pausedAt = 0;
      }
      const t = easeInOut(Math.min(1, (now - started - pauseMs) / FLIGHT_MS));
      if (t >= 1) {
        followFlight(map, plane, path, stop, 1, Math.min(startZoom, CRUISE_ZOOM), startPitch, startBearing, false);
        lockCityView();
        return;
      }
      const moveCamera = now - lastCamera >= CAMERA_MS;
      if (moveCamera) {
        lastCamera = now;
      }
      followFlight(map, plane, path, stop, t, Math.min(startZoom, CRUISE_ZOOM), startPitch, startBearing, moveCamera);
      flightTickRef.current = tick;
      flightRef.current = window.requestAnimationFrame(tick);
    };
    flightTickRef.current = tick;
    flightRef.current = window.requestAnimationFrame(tick);

    return () => {
      flightTickRef.current = null;
      window.cancelAnimationFrame(flightRef.current);
      window.clearTimeout(popupTimerRef.current);
      window.clearTimeout(playAdvanceRef.current);
    };
  }, [index, ready, stop, tour]);

  useEffect(() => {
    if (!ready || autoStartedRef.current || tour.length < 2) {
      return;
    }
    autoStartedRef.current = true;
    setPlaying(true);
  }, [ready, tour.length]);

  useEffect(() => {
    if (!playing || index !== 0) {
      return;
    }
    const kickoff = window.setTimeout(() => {
      setIndex((current) => nextTourIndex(current, tour.length));
    }, 1800);
    return () => window.clearTimeout(kickoff);
  }, [playing, index, tour.length]);

  useEffect(() => {
    playingRef.current = playing;
    if (!playing) {
      window.clearTimeout(playAdvanceRef.current);
      mapRef.current?.stop();
      return;
    }
    if (flightTickRef.current) {
      flightRef.current = window.requestAnimationFrame(flightTickRef.current);
    }
    if (popupOpen) {
      queueNextIfPlaying(POPUP_HOLD_MS);
    }
  }, [playing]);

  if (!stop) {
    return null;
  }

  return (
    <section className="global-stage" aria-label="ICE Institute at Global Stage">
      <div className="global-stage-scene">
        <div className="global-stage-map" ref={host} />
        <h1 className="tour-title">ICE at Global Stage</h1>
        <div className="tour-icon-bar">
          <button type="button" className="tour-back" aria-label="Back to main" onClick={onClose}>
            <Icon d="M15 18l-6-6 6-6" />
            Back to main
          </button>
          <div className="tour-play-bar">
            <button
              type="button"
              aria-label="Previous stop"
              onClick={() => {
                setPlaying(false);
                setIndex((current) => prevTourIndex(current));
              }}
            >
              <SkipBackIcon />
            </button>
            <button
              type="button"
              className="play"
              aria-label={playing ? 'Pause tour' : 'Play tour'}
              onClick={() => setPlaying((current) => !current)}
            >
              {playing ? <PauseCircleIcon /> : <PlayCircleIcon />}
            </button>
            <button
              type="button"
              aria-label="Next stop"
              onClick={() => {
                setPlaying(false);
                setIndex((current) => nextTourIndex(current, tour.length));
              }}
            >
              <SkipForthIcon />
            </button>
          </div>
          <div className="tour-layer-wrap">
            <button
              type="button"
              aria-label="Map layers"
              aria-expanded={layersOpen}
              onClick={() => setLayersOpen((open) => !open)}
            >
              <Icon d="M12 4l8 4-8 4-8-4 8-4zm-8 8l8 4 8-4M4 16l8 4 8-4" />
            </button>
            {layersOpen ? (
              <div className="tour-layer-menu" role="menu">
                {MAP_LAYERS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="menuitem"
                    className={item.id === layer ? 'active' : undefined}
                    onClick={() => {
                      setLayer(item.id);
                      setLayersOpen(false);
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        <DateReel isoDate={calendarDate} />
        {popupOpen && stop.kind === 'event' ? (
          <article
            className="tour-popup-card"
            dangerouslySetInnerHTML={{ __html: tourPopupHtml(stop) ?? '' }}
          />
        ) : null}
      </div>
    </section>
  );
}
