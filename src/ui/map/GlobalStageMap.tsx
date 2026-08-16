import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Map,
  Marker,
  NavigationControl,
  Popup,
  type GeoJSONSource,
  type StyleSpecification,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  FLIGHT_MS,
  POPUP_DELAY_MS,
  TOUR_STEP_MS,
  greatCircle,
  headingDegrees,
  pathCoordinates,
  pointAlong,
  slicePath,
  type LngLat,
} from '../../application/flight-path';
import { buildGlobalTour, MOGADISHU_HOME, nextTourIndex, prevTourIndex, tourPopupHtml, type TourStop } from '../../application/global-tour';
import { MAP_LAYERS, styleForLayer, type MapLayerId } from '../../application/map-layers';
import type { Story } from '../../domain/story';

type Props = {
  stories: Story[];
  onClose: () => void;
};

const EMPTY_LINE: GeoJSON.Feature<GeoJSON.LineString> = {
  type: 'Feature',
  properties: {},
  geometry: { type: 'LineString', coordinates: [] },
};

const applyGlobe = (map: Map) => {
  const globeMap = map as Map & { setProjection?: (projection: { type: string }) => void };
  globeMap.setProjection?.({ type: 'globe' });
};

const createMap = (container: HTMLDivElement, style: StyleSpecification): Map => {
  const map = new Map({
    container,
    style,
    center: [20, 10],
    zoom: 2.4,
    pitch: 32,
    bearing: 0,
    minZoom: 1.6,
    maxZoom: 4.6,
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
        'line-color': '#94a8a3',
        'line-width': 2.4,
        'line-opacity': 0.7,
        'line-dasharray': [2.2, 1.8],
      },
    });
    map.addLayer({
      id: 'flight-progress-glow',
      type: 'line',
      source: 'flight-progress',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#4CAF7D',
        'line-width': 9,
        'line-opacity': 0.28,
        'line-blur': 2.5,
      },
    });
    map.addLayer({
      id: 'flight-progress',
      type: 'line',
      source: 'flight-progress',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#4CAF7D',
        'line-width': 4.4,
        'line-opacity': 1,
      },
    });
  }
};

const setLineData = (map: Map, sourceId: string, path: LngLat[]) => {
  const source = map.getSource(sourceId) as GeoJSONSource | undefined;
  source?.setData(path.length >= 2 ? lineFeature(path) : EMPTY_LINE);
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
    rotationAlignment: 'map',
    pitchAlignment: 'viewport',
  });
};

const easeInOut = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

const lerp = (from: number, to: number, t: number): number => from + (to - from) * t;

const parkPlane = (plane: Marker, at: LngLat, heading: number) => {
  plane.setLngLat([at.lng, at.lat]).setRotation(heading);
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
  const [layer, setLayer] = useState<MapLayerId>('carto-voyager');
  const tour = useMemo(() => buildGlobalTour(stories), [stories]);
  const stop: TourStop | undefined = tour[index];

  useEffect(() => {
    if (!host.current) {
      return;
    }
    const map = createMap(host.current, styleForLayer(layer));
    mapRef.current = map;
    map.on('load', () => setReady(true));
    return () => {
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
      const marker = new Marker({ color: '#2E7D57' }).setLngLat([stop.lng, stop.lat]);
      const html = tourPopupHtml(stop);
      if (html) {
        marker
          .setPopup(
            new Popup({
              offset: 28,
              maxWidth: '320px',
              className: 'tour-popup',
              closeOnClick: false,
            }).setHTML(html),
          )
          .addTo(map);
      } else {
        marker.addTo(map);
      }
      markerRef.current = marker;
    }

    const originStop = tour[lastIndexRef.current] ?? stop;
    const origin: LngLat = { lng: originStop.lng, lat: originStop.lat };
    const dest: LngLat = { lng: stop.lng, lat: stop.lat };
    const moved = origin.lat !== dest.lat || origin.lng !== dest.lng;
    lastIndexRef.current = index;

    map.stop();
    window.cancelAnimationFrame(flightRef.current);
    window.clearTimeout(popupTimerRef.current);
    if (!moved) {
      setLineData(map, 'flight-route', []);
      setLineData(map, 'flight-progress', []);
      parkPlane(plane, dest, 12);
      map.easeTo({
        center: [stop.lng, stop.lat],
        zoom: stop.zoom,
        pitch: stop.pitch,
        bearing: stop.bearing,
        duration: 1200,
        essential: true,
      });
      if (stop.kind === 'event') {
        popupTimerRef.current = window.setTimeout(() => {
          markerRef.current?.togglePopup();
        }, POPUP_DELAY_MS);
      }
      return;
    }

    const path = greatCircle(origin, dest, 96);
    setLineData(map, 'flight-route', path);
    setLineData(map, 'flight-progress', slicePath(path, 0.02));
    parkPlane(plane, origin, headingDegrees(origin, dest));
    const startZoom = Math.min(map.getZoom(), 3);
    const startPitch = map.getPitch();
    const startBearing = map.getBearing();
    const started = performance.now();

    const tick = (now: number) => {
      const t = easeInOut(Math.min(1, (now - started) / FLIGHT_MS));
      const here = pointAlong(path, t);
      const ahead = pointAlong(path, Math.min(1, t + 0.02));
      parkPlane(plane, here, headingDegrees(here, ahead));
      setLineData(map, 'flight-progress', slicePath(path, Math.max(t, 0.02)));
      map.jumpTo({
        center: [here.lng, here.lat],
        zoom: lerp(startZoom, stop.zoom, t),
        pitch: lerp(startPitch, stop.pitch, t),
        bearing: lerp(startBearing, stop.bearing, t),
      });
      const dash = ((now - started) / 140) % 6;
      if (map.getLayer('flight-route')) {
        map.setPaintProperty('flight-route', 'line-dasharray', [0, dash, 1.6, 1.4]);
      }
      if (t < 1) {
        flightRef.current = window.requestAnimationFrame(tick);
        return;
      }
      setLineData(map, 'flight-progress', path);
      map.jumpTo({
        center: [stop.lng, stop.lat],
        zoom: stop.zoom,
        pitch: stop.pitch,
        bearing: stop.bearing,
      });
      if (stop.kind === 'event') {
        popupTimerRef.current = window.setTimeout(() => {
          markerRef.current?.togglePopup();
        }, POPUP_DELAY_MS);
      }
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
      <div className="global-stage-map" ref={host} />
    </section>
  );
}
