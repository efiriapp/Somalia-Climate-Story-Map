import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AttributionControl,
  Map,
  Marker,
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
  slicePath,
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

const applyGlobe = (map: Map) => {
  const globeMap = map as Map & { setProjection?: (projection: { type: string }) => void };
  globeMap.setProjection?.({ type: 'globe' });
};

const attachTrailCanvas = (map: Map): HTMLCanvasElement => {
  const host = map.getCanvasContainer();
  const existing = host.querySelector('.flight-trail-canvas') as HTMLCanvasElement | null;
  if (existing) {
    return existing;
  }
  const canvas = document.createElement('canvas');
  canvas.className = 'flight-trail-canvas';
  const gl = map.getCanvas();
  host.insertBefore(canvas, gl.nextSibling);
  return canvas;
};

const paintTrail = (
  map: Map,
  canvas: HTMLCanvasElement,
  traces: [number, number][][],
  current: LngLat[],
) => {
  const view = map.getCanvas();
  const dpr = window.devicePixelRatio || 1;
  const width = view.clientWidth;
  const height = view.clientHeight;
  if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const stroke = (points: LngLat[]) => {
    if (points.length < 2) {
      return;
    }
    ctx.beginPath();
    let drawing = false;
    let lastX = 0;
    let lastY = 0;
    for (const point of points) {
      const pixel = map.project([point.lng, point.lat]);
      if (drawing && Math.hypot(pixel.x - lastX, pixel.y - lastY) > 220) {
        drawing = false;
      }
      if (!drawing) {
        ctx.moveTo(pixel.x, pixel.y);
        drawing = true;
      } else {
        ctx.lineTo(pixel.x, pixel.y);
      }
      lastX = pixel.x;
      lastY = pixel.y;
    }
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.setLineDash([12, 8]);
    ctx.strokeStyle = '#063D39';
    ctx.lineWidth = 4;
    ctx.stroke();
  };
  for (const coords of traces) {
    stroke(coords.map(([lng, lat]) => ({ lng, lat })));
  }
  stroke(current);
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
  onTrail: (path: LngLat[], traveled: number) => void,
) => {
  const here = pointAlong(path, t);
  parkPlane(plane, here, arriveHeading(path, t));
  onTrail(path, t);
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
  const currentTrailRef = useRef<LngLat[]>([]);
  const trailCanvasRef = useRef<HTMLCanvasElement | null>(null);
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
    const redrawTrail = () => {
      const canvas = trailCanvasRef.current;
      if (!canvas) {
        return;
      }
      paintTrail(map, canvas, tracesRef.current, currentTrailRef.current);
    };
    map.on('load', () => {
      trailCanvasRef.current = attachTrailCanvas(map);
      fitScreen();
      setReady(true);
    });
    map.on('render', redrawTrail);
    window.addEventListener('resize', fitScreen);
    return () => {
      window.removeEventListener('resize', fitScreen);
      map.off('render', redrawTrail);
      window.cancelAnimationFrame(flightRef.current);
      window.clearTimeout(popupTimerRef.current);
      window.clearTimeout(playAdvanceRef.current);
      markerRef.current?.remove();
      homeMarkerRef.current?.remove();
      planeRef.current?.remove();
      markerRef.current = null;
      homeMarkerRef.current = null;
      planeRef.current = null;
      trailCanvasRef.current = null;
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
      trailCanvasRef.current = attachTrailCanvas(map);
      setReady(true);
    });
  }, [layer]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !stop) {
      return;
    }
    const onTrail = (path: LngLat[], traveled: number) => {
      currentTrailRef.current = slicePath(path, Math.max(traveled, 0.02));
      const canvas = trailCanvasRef.current;
      if (canvas) {
        paintTrail(map, canvas, tracesRef.current, currentTrailRef.current);
      }
    };
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
      currentTrailRef.current = [];
      const canvas = trailCanvasRef.current;
      if (canvas) {
        paintTrail(map, canvas, tracesRef.current, currentTrailRef.current);
      }
      parkPlane(plane, dest, 12);
      applyStopView(map, stop);
      afterArrive();
      return;
    }

    const path = greatCircle(origin, dest, 96);
    onTrail(path, 0);
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
      onTrail(path, 0);
    } else {
      followFlight(map, plane, path, stop, 0, startZoom, startPitch, startBearing, true, onTrail);
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
      onTrail(path, 1);
      tracesRef.current = [...tracesRef.current, pathCoordinates(path)];
      const canvas = trailCanvasRef.current;
      if (canvas) {
        paintTrail(map, canvas, tracesRef.current, currentTrailRef.current);
      }
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
        followFlight(map, plane, path, stop, 1, Math.min(startZoom, CRUISE_ZOOM), startPitch, startBearing, false, onTrail);
        lockCityView();
        return;
      }
      const moveCamera = now - lastCamera >= CAMERA_MS;
      if (moveCamera) {
        lastCamera = now;
      }
      followFlight(map, plane, path, stop, t, Math.min(startZoom, CRUISE_ZOOM), startPitch, startBearing, moveCamera, onTrail);
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
        <h1 className="tour-title">ICE Institute at Global Stage</h1>
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
