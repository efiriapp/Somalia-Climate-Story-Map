import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Map,
  Marker,
  NavigationControl,
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
  TOUR_STEP_MS,
  arriveHeading,
  cruiseThenArrive,
  greatCircle,
  pathCoordinates,
  pointAlong,
  type LngLat,
} from '../../application/flight-path';
import { buildGlobalTour, GLOBE_PADDING, GLOBE_VIEW, MOGADISHU_HOME, nextTourIndex, prevTourIndex, tourPopupHtml, type TourStop } from '../../application/global-tour';
import { MAP_LAYERS, styleForLayer, type MapLayerId } from '../../application/map-layers';
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
    padding: stop.kind === 'home' ? GLOBE_PADDING : { top: 72, bottom: 72, left: 32, right: 32 },
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
    padding: GLOBE_PADDING,
  });
  map.addControl(new NavigationControl({ visualizePitch: true }), 'bottom-right');
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
  if (!map.getSource('flight-route')) {
    map.addSource('flight-route', { type: 'geojson', data: EMPTY_LINE, lineMetrics: true });
    map.addSource('flight-progress', { type: 'geojson', data: EMPTY_LINE, lineMetrics: true });
  }
  if (!map.getLayer('flight-route')) {
    map.addLayer({
      id: 'flight-route',
      type: 'line',
      source: 'flight-route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#8aa39c',
        'line-width': 3,
        'line-opacity': 0.85,
        'line-dasharray': [2.4, 1.6],
      },
    });
    map.addLayer({
      id: 'flight-progress-case',
      type: 'line',
      source: 'flight-progress',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#063D39',
        'line-width': 8,
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
        'line-width': 5,
        'line-opacity': 1,
        'line-trim-offset': [0, 1],
      },
    });
  }
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

export function GlobalStageMap({ stories, onClose }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const homeMarkerRef = useRef<Marker | null>(null);
  const planeRef = useRef<Marker | null>(null);
  const lastIndexRef = useRef(0);
  const flightRef = useRef(0);
  const popupTimerRef = useRef(0);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [layer, setLayer] = useState<MapLayerId>('carto-voyager');
  const tour = useMemo(() => buildGlobalTour(stories), [stories]);
  const stop: TourStop | undefined = tour[index];

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
    setPopupOpen(false);
    if (!moved) {
      setLineData(map, 'flight-route', []);
      setLineData(map, 'flight-progress', []);
      parkPlane(plane, dest, 12);
      applyStopView(map, stop);
      if (stop.kind === 'event') {
        popupTimerRef.current = window.setTimeout(() => {
          setPopupOpen(true);
        }, CITY_EASE_MS + POPUP_DELAY_MS);
      }
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
    let lastCamera = started;
    let cityLocked = false;

    const lockCityView = () => {
      if (cityLocked) {
        return;
      }
      cityLocked = true;
      window.cancelAnimationFrame(flightRef.current);
      parkPlane(plane, dest, arriveHeading(path, 1));
      setTravelTrim(map, 1);
      applyStopView(map, stop);
      if (stop.kind === 'event') {
        popupTimerRef.current = window.setTimeout(() => {
          setPopupOpen(true);
        }, CITY_EASE_MS + POPUP_DELAY_MS);
      }
    };

    const tick = (now: number) => {
      const t = easeInOut(Math.min(1, (now - started) / FLIGHT_MS));
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
      flightRef.current = window.requestAnimationFrame(tick);
    };
    flightRef.current = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(flightRef.current);
      window.clearTimeout(popupTimerRef.current);
    };
  }, [index, ready, stop, tour]);

  useEffect(() => {
    if (!playing) {
      return;
    }
    const timer = window.setInterval(() => {
      setIndex((current) => {
        const next = nextTourIndex(current, tour.length);
        if (next === current) {
          setPlaying(false);
        }
        return next;
      });
    }, TOUR_STEP_MS);
    return () => window.clearInterval(timer);
  }, [playing, tour.length]);

  if (!stop) {
    return null;
  }

  return (
    <section className="global-stage" aria-label="ICE Institute at Global Stage">
      <header className="global-stage-bar">
        <button type="button" className="global-stage-back" onClick={onClose}>
          ← Back
        </button>
        <div>
          <p className="kicker">ICE Institute at Global Stage</p>
          <h2>2023 – 2026</h2>
        </div>
        <div className="global-stage-controls">
          <button
            type="button"
            aria-label="Previous stop"
            onClick={() => {
              setPlaying(false);
              setIndex((current) => prevTourIndex(current));
            }}
          >
            ←
          </button>
          <button
            type="button"
            className="play"
            aria-label={playing ? 'Pause tour' : 'Play tour'}
            onClick={() => setPlaying((current) => !current)}
          >
            {playing ? '❚❚' : '▶'}
          </button>
          <button
            type="button"
            aria-label="Next stop"
            onClick={() => {
              setPlaying(false);
              setIndex((current) => nextTourIndex(current, tour.length));
            }}
          >
            →
          </button>
        </div>
        <label className="layer-switch">
          3D map layers
          <select value={layer} onChange={(event) => setLayer(event.target.value as MapLayerId)}>
            {MAP_LAYERS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </header>
      <div className="global-stage-scene">
        <div className="global-stage-map" ref={host} />
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
