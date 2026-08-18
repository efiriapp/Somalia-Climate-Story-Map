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
  distanceKm,
  greatCircle,
  pathCoordinates,
  pointAlong,
  slicePath,
  type LngLat,
} from '../../application/flight-path';
import {
  constrainTourFilter,
  continentSummaries,
  defaultTourFilter,
  filterContinents,
  filterCountries,
  filterYears,
  firstEventIndexByCountry,
  firstEventIndexForDate,
  firstEventIndexMatching,
  matchesTourFilter,
  searchTourStops,
  summaryTotal,
  tallyContinentVisits,
} from '../../application/continent-visits';
import { buildGlobalTour, GLOBE_PADDING, GLOBE_VIEW, MOGADISHU_HOME, nextTourIndex, prevTourIndex, tourPopupHtml, type TourStop } from '../../application/global-tour';
import { MAP_LAYERS, styleForLayer, type MapLayerId } from '../../application/map-layers';
import { DEFAULT_TOUR_SOUND_VOLUME, getTourSoundVolume, playLandingSound, playTakeoffSound, setTourSoundMuted, setTourSoundVolume, startFlightSound, stopFlightSound, unlockTourSound } from '../../application/tour-sound';
import { ContinentCards } from './ContinentCards';
import { ContinentSummaryCards } from './ContinentSummaryCards';
import { DateReel } from './DateReel';
import { TourFilterSlide } from './TourFilterSlide';
import { SiteFooter } from '../chrome/SiteFooter';
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
  measure: LngLat[] = [],
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
  if (measure.length >= 2) {
    ctx.beginPath();
    let drawing = false;
    let lastX = 0;
    let lastY = 0;
    for (const point of measure) {
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
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = '#4CAF7D';
    ctx.lineWidth = 4;
    ctx.stroke();
  }
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
  });
  map.setPadding(GLOBE_PADDING);
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
  plane.getElement().style.zIndex = '40';
};

const applyPlaneVisibility = (plane: Marker, visible: boolean) => {
  plane.getElement().classList.toggle('is-hidden', !visible);
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

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="11" cy="11" r="6.2" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M20 20l-3.6-3.6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const HomeIcon = () => <Icon d="M4 11.5 12 4l8 7.5V20H15v-6H9v6H4z" />;
const CompassIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="9.1" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="m12 6 2.4 6.4L12 18l-2.4-5.6Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);
const MeasureIcon = () => <Icon d="M4 8h16v8H4zm3 0v4m3-4v3m3-3v4m3-4v3" />;
const PathIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M4 18c3-6 5 0 8-6s5 0 8-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeDasharray="3 3"
      strokeLinecap="round"
    />
  </svg>
);
const PlaneIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
      fill="currentColor"
      stroke="none"
    />
  </svg>
);
const FilterIcon = () => <Icon d="M4 6h16M7 12h10M10 18h4" />;
const SoundIcon = ({ volume }: { volume: number }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M3 10v4h3l4 4V6L6 10H3z"
      fill="currentColor"
      stroke="none"
    />
    {volume <= 0 ? (
      <path d="M16 9l6 6M22 9l-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    ) : (
      <>
        <path
          d="M15 9.5a3.5 3.5 0 010 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {volume > 0.5 ? (
          <path
            d="M17.5 7a6 6 0 010 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        ) : null}
      </>
    )}
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
  const measurePointsRef = useRef<LngLat[]>([]);
  const measuringRef = useRef(false);
  const showPathRef = useRef(true);
  const showPlaneRef = useRef(true);
  const playingRef = useRef(false);
  const playAdvanceRef = useRef(0);
  const flightTickRef = useRef<((now: number) => void) | null>(null);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [measuring, setMeasuring] = useState(false);
  const [measureKm, setMeasureKm] = useState<number | null>(null);
  const [showPath, setShowPath] = useState(true);
  const [showPlane, setShowPlane] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [soundVolume, setSoundVolume] = useState(DEFAULT_TOUR_SOUND_VOLUME);
  const [filter, setFilter] = useState(defaultTourFilter());
  const [visits, setVisits] = useState<{ country: string; date: string }[]>([]);
  const seenVisitsRef = useRef(new Set<string>());
  const [layer, setLayer] = useState<MapLayerId>('carto-voyager');
  const tour = useMemo(() => buildGlobalTour(stories), [stories]);
  const years = useMemo(() => filterYears(stories), [stories]);
  const continentOptions = useMemo(() => filterContinents(stories, filter.year), [stories, filter.year]);
  const countryOptions = useMemo(
    () => filterCountries(stories, filter.year, filter.continent),
    [stories, filter.year, filter.continent],
  );
  const visitedCountries = useMemo(
    () => visits.filter((visit) => matchesTourFilter(visit, filter)).map((visit) => visit.country),
    [visits, filter],
  );
  const continents = useMemo(() => {
    const rows = tallyContinentVisits(visitedCountries);
    return filter.continent === 'all' ? rows : rows.filter((row) => row.continent === filter.continent);
  }, [visitedCountries, filter.continent]);
  const summaries = useMemo(
    () => continentSummaries(stories, { ...filter, continent: 'all' }),
    [stories, filter],
  );
  const total = useMemo(
    () => summaryTotal(stories, { ...filter, continent: 'all' }),
    [stories, filter],
  );
  const searchHits = useMemo(
    () => searchTourStops(tour, searchQuery).filter((hit) => matchesTourFilter(hit, filter)),
    [tour, searchQuery, filter],
  );
  const stop: TourStop | undefined = tour[index];
  const [calendarDate, setCalendarDate] = useState(tour[0]?.date ?? '2023-01-01');
  playingRef.current = playing;
  measuringRef.current = measuring;
  showPathRef.current = showPath;
  showPlaneRef.current = showPlane;

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
      paintTrail(
        map,
        canvas,
        showPathRef.current ? tracesRef.current : [],
        showPathRef.current ? currentTrailRef.current : [],
        measurePointsRef.current,
      );
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
      stopFlightSound();
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
    if (!map || !ready) {
      return;
    }
    map.getCanvas().style.cursor = measuring ? 'crosshair' : '';
    const onClick = (event: { lngLat: { lng: number; lat: number } }) => {
      if (!measuringRef.current) {
        return;
      }
      const point = { lng: event.lngLat.lng, lat: event.lngLat.lat };
      const previous = measurePointsRef.current;
      const next = previous.length >= 2 ? [point] : [...previous, point];
      measurePointsRef.current = next;
      setMeasureKm(next.length === 2 ? distanceKm(next[0], next[1]) : null);
      const canvas = trailCanvasRef.current;
      if (canvas) {
        paintTrail(
          map,
          canvas,
          showPathRef.current ? tracesRef.current : [],
          showPathRef.current ? currentTrailRef.current : [],
          next,
        );
      }
    };
    map.on('click', onClick);
    return () => {
      map.off('click', onClick);
      map.getCanvas().style.cursor = '';
    };
  }, [ready, measuring]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !stop) {
      return;
    }
    const onTrail = (path: LngLat[], traveled: number) => {
      currentTrailRef.current = slicePath(path, Math.max(traveled, 0.02));
      const canvas = trailCanvasRef.current;
      if (canvas) {
        paintTrail(
        map,
        canvas,
        showPathRef.current ? tracesRef.current : [],
        showPathRef.current ? currentTrailRef.current : [],
        measurePointsRef.current,
      );
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
    applyPlaneVisibility(planeRef.current, showPlaneRef.current);
    const plane = planeRef.current;
    markerRef.current?.remove();
    markerRef.current = null;
    if (stop.kind === 'event') {
      markerRef.current = new Marker({ color: '#2E7D57' }).setLngLat([stop.lng, stop.lat]).addTo(map);
      const pin = markerRef.current.getElement();
      pin.style.cursor = 'pointer';
      pin.setAttribute('role', 'button');
      pin.setAttribute('aria-label', 'Show event popup');
      pin.addEventListener('click', () => setPopupOpen(true));
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
    const showPopupNow = !playingRef.current && stop.kind === 'event';
    setPopupOpen(showPopupNow);
    stopFlightSound();
    const afterArrive = () => {
      if (stop.kind === 'home') {
        setCalendarDate(stop.date);
      }
      if (stop.kind === 'event') {
        if (stop.storyId && !seenVisitsRef.current.has(stop.storyId)) {
          seenVisitsRef.current.add(stop.storyId);
          setVisits((current) => [...current, { country: stop.country, date: stop.date }]);
        }
        popupTimerRef.current = window.setTimeout(() => {
          setPopupOpen(true);
          queueNextIfPlaying(POPUP_HOLD_MS);
        }, playingRef.current ? CITY_EASE_MS + POPUP_DELAY_MS : 0);
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
        paintTrail(
        map,
        canvas,
        showPathRef.current ? tracesRef.current : [],
        showPathRef.current ? currentTrailRef.current : [],
        measurePointsRef.current,
      );
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
    playTakeoffSound();
    startFlightSound();
    const started = performance.now();
    let pauseMs = 0;
    let pausedAt = 0;
    let lastCamera = started;
    let cityLocked = false;
    const holdForPause = playingRef.current;

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
        paintTrail(
        map,
        canvas,
        showPathRef.current ? tracesRef.current : [],
        showPathRef.current ? currentTrailRef.current : [],
        measurePointsRef.current,
      );
      }
      applyStopView(map, stop);
      playLandingSound();
      afterArrive();
    };

    const tick = (now: number) => {
      if (holdForPause && !playingRef.current) {
        if (!pausedAt) {
          pausedAt = now;
          stopFlightSound();
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
      startFlightSound();
      flightRef.current = window.requestAnimationFrame(flightTickRef.current);
    }
    if (popupOpen) {
      queueNextIfPlaying(POPUP_HOLD_MS);
    }
  }, [playing]);

  const goHomeView = () => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    setPlaying(false);
    map.easeTo({
      center: [GLOBE_VIEW.lng, GLOBE_VIEW.lat],
      zoom: GLOBE_VIEW.zoom,
      pitch: GLOBE_VIEW.pitch,
      bearing: GLOBE_VIEW.bearing,
      duration: 1200,
      essential: true,
      padding: GLOBE_PADDING,
    });
  };

  const goNorth = () => {
    mapRef.current?.easeTo({ bearing: 0, duration: 800, essential: true });
  };

  const toggleMeasure = () => {
    const next = !measuring;
    setMeasuring(next);
    setLayersOpen(false);
    setSearchOpen(false);
    setVolumeOpen(false);
    if (!next) {
      measurePointsRef.current = [];
      setMeasureKm(null);
      const map = mapRef.current;
      const canvas = trailCanvasRef.current;
      if (map && canvas) {
        paintTrail(
          map,
          canvas,
          showPathRef.current ? tracesRef.current : [],
          showPathRef.current ? currentTrailRef.current : [],
          [],
        );
      }
    }
  };

  const resetMap = () => {
    window.cancelAnimationFrame(flightRef.current);
    window.clearTimeout(popupTimerRef.current);
    window.clearTimeout(playAdvanceRef.current);
    stopFlightSound();
    playingRef.current = false;
    setPlaying(false);
    setPopupOpen(false);
    setFilter(defaultTourFilter());
    seenVisitsRef.current.clear();
    setVisits([]);
    lastIndexRef.current = 0;
    tracesRef.current = [];
    currentTrailRef.current = [];
    setCalendarDate(tour[0]?.date ?? '2023-01-01');
    setIndex(0);
    goHomeView();
    setSearchOpen(false);
    setSearchQuery('');
    setFiltersOpen(false);
    setLayersOpen(false);
    setVolumeOpen(false);
    setMeasuring(false);
    measurePointsRef.current = [];
    setMeasureKm(null);
    showPathRef.current = true;
    setShowPath(true);
    showPlaneRef.current = true;
    setShowPlane(true);
    if (planeRef.current) {
      applyPlaneVisibility(planeRef.current, true);
      parkPlane(planeRef.current, { lng: MOGADISHU_HOME.lng, lat: MOGADISHU_HOME.lat }, 12);
    }
    setTourSoundMuted(false);
    setTourSoundVolume(DEFAULT_TOUR_SOUND_VOLUME);
    setSoundVolume(DEFAULT_TOUR_SOUND_VOLUME);
    const map = mapRef.current;
    const canvas = trailCanvasRef.current;
    if (map && canvas) {
      paintTrail(map, canvas, [], [], []);
    }
  };

  const togglePath = () => {
    const next = !showPath;
    showPathRef.current = next;
    setShowPath(next);
    const map = mapRef.current;
    const canvas = trailCanvasRef.current;
    if (map && canvas) {
      paintTrail(
        map,
        canvas,
        next ? tracesRef.current : [],
        next ? currentTrailRef.current : [],
        measurePointsRef.current,
      );
    }
  };

  const togglePlane = () => {
    const next = !showPlane;
    showPlaneRef.current = next;
    setShowPlane(next);
    if (planeRef.current) {
      applyPlaneVisibility(planeRef.current, next);
    }
    if (next) {
      setTourSoundMuted(false);
    } else {
      setTourSoundMuted(true);
    }
    setSoundVolume(getTourSoundVolume());
  };

  const goToStop = (nextIndex: number) => {
    if (nextIndex < 0) {
      return;
    }
    setPlaying(false);
    setSearchOpen(false);
    setIndex(nextIndex);
  };

  const goToStopFromHome = (nextIndex: number) => {
    if (nextIndex < 0) {
      return;
    }
    if (nextIndex === index) {
      setPlaying(false);
      setSearchOpen(false);
      if (tour[nextIndex]?.kind === 'event') {
        setPopupOpen(true);
      }
      return;
    }
    lastIndexRef.current = 0;
    goToStop(nextIndex);
  };

  const updateFilter = (next: typeof filter) => {
    const constrained = constrainTourFilter(stories, next);
    setFilter(constrained);
    goToStopFromHome(firstEventIndexMatching(tour, constrained));
  };

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
              onClick={() => {
                unlockTourSound();
                setPlaying((current) => !current);
              }}
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
              aria-label="Search tour"
              aria-expanded={searchOpen}
              onClick={() => {
                setSearchOpen((open) => !open);
                setLayersOpen(false);
                setFiltersOpen(false);
                setVolumeOpen(false);
              }}
            >
              <SearchIcon />
            </button>
            {searchOpen ? (
              <div className="tour-search-panel">
                <input
                  className="tour-search-input"
                  value={searchQuery}
                  autoFocus
                  placeholder="Search country or event..."
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
                {searchHits.map((hit) => (
                  <button
                    key={hit.storyId ?? hit.title}
                    type="button"
                    onClick={() => goToStopFromHome(tour.findIndex((item) => item.storyId === hit.storyId))}
                  >
                    {hit.country} — {hit.title}
                  </button>
                ))}
                {searchHits.length === 0 ? <p>No matches</p> : null}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className={showPath ? 'active' : undefined}
            aria-label={showPath ? 'Hide path' : 'Show path'}
            aria-pressed={showPath}
            onClick={togglePath}
          >
            <PathIcon />
          </button>
          <button
            type="button"
            className={showPlane ? 'active' : undefined}
            aria-label={showPlane ? 'Hide airplane' : 'Show airplane'}
            aria-pressed={showPlane}
            onClick={togglePlane}
          >
            <PlaneIcon />
          </button>
          <button
            type="button"
            className={filtersOpen ? 'active' : undefined}
            aria-label={filtersOpen ? 'Hide filters' : 'Show filters'}
            aria-expanded={filtersOpen}
            onClick={() => {
              setFiltersOpen((open) => !open);
              setLayersOpen(false);
              setSearchOpen(false);
              setVolumeOpen(false);
            }}
          >
            <FilterIcon />
          </button>
          <div className="tour-layer-wrap">
            <button
              type="button"
              className={volumeOpen || soundVolume === 0 ? 'active' : undefined}
              aria-label="Sound volume"
              aria-expanded={volumeOpen}
              onClick={() => {
                unlockTourSound();
                setVolumeOpen((open) => !open);
                setLayersOpen(false);
                setSearchOpen(false);
                setFiltersOpen(false);
              }}
            >
              <SoundIcon volume={soundVolume} />
            </button>
            {volumeOpen ? (
              <div className="tour-volume-menu">
                <input
                  className="tour-volume-slider"
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={Math.round(soundVolume * 10)}
                  aria-label="Sound volume"
                  aria-valuemin={0}
                  aria-valuemax={10}
                  aria-valuenow={Math.round(soundVolume * 10)}
                  onChange={(event) => {
                    const next = Number(event.target.value) / 10;
                    setSoundVolume(next);
                    setTourSoundVolume(next);
                  }}
                />
              </div>
            ) : null}
          </div>
        </div>
        <div className="tour-tool-bar">
          <button type="button" aria-label="Home view" onClick={goHomeView}>
            <HomeIcon />
          </button>
          <button
            type="button"
            className={measuring ? 'active' : undefined}
            aria-label="Measure length"
            aria-pressed={measuring}
            onClick={toggleMeasure}
          >
            <MeasureIcon />
          </button>
          <button type="button" aria-label="Compass north" onClick={goNorth}>
            <CompassIcon />
          </button>
          <div className="tour-layer-wrap">
            <button
              type="button"
              aria-label="Map layers"
              aria-expanded={layersOpen}
              onClick={() => {
                setLayersOpen((open) => !open);
                setSearchOpen(false);
                setFiltersOpen(false);
                setVolumeOpen(false);
              }}
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
        <div className={filtersOpen ? 'tour-left-stack filters-open' : 'tour-left-stack'}>
          <TourFilterSlide
            open={filtersOpen}
            filter={filter}
            years={years}
            continents={continentOptions}
            countries={countryOptions}
            onYear={(year) => updateFilter({ ...filter, year })}
            onContinent={(continent) => updateFilter({ ...filter, continent, country: 'all' })}
            onCountry={(country) => updateFilter({ ...filter, country })}
          />
          <ContinentSummaryCards
            cards={summaries}
            total={total}
            activeContinent={filter.continent === 'all' ? undefined : filter.continent}
            activeTotal={filter.continent === 'all' && filter.country === 'all'}
            onContinent={(continent) => updateFilter({ ...filter, continent, country: 'all' })}
            onTotal={() => updateFilter(defaultTourFilter())}
          />
        </div>
        <div className="tour-right-stack">
          <DateReel
            isoDate={calendarDate}
            onDateChange={(iso) => {
              setCalendarDate(iso);
              const year = Number.parseInt(iso.slice(0, 4), 10);
              setFilter(constrainTourFilter(stories, { ...filter, year }));
              goToStopFromHome(firstEventIndexForDate(tour, iso));
            }}
            onPrev={() => {
              setPlaying(false);
              const next = prevTourIndex(index);
              setCalendarDate(tour[next]?.date ?? calendarDate);
              setIndex(next);
            }}
            onNext={() => {
              setPlaying(false);
              const next = nextTourIndex(index, tour.length);
              setCalendarDate(tour[next]?.date ?? calendarDate);
              setIndex(next);
            }}
          />
          <ContinentCards
            cards={continents}
            onCountry={(country) => goToStopFromHome(firstEventIndexByCountry(tour, country, filter.year))}
            onReset={resetMap}
          />
        </div>
        {measuring ? (
          <p className="tour-measure-badge">
            {measureKm == null ? 'Click two points' : `${Math.round(measureKm).toLocaleString('en-GB')} km`}
          </p>
        ) : null}
        {popupOpen && stop.kind === 'event' ? (
          <article className="tour-popup-card">
            <button
              type="button"
              className="tour-popup-close"
              aria-label="Close popup"
              onClick={() => setPopupOpen(false)}
            >
              ×
            </button>
            <div dangerouslySetInnerHTML={{ __html: tourPopupHtml(stop) ?? '' }} />
          </article>
        ) : null}
      </div>
      <SiteFooter />
    </section>
  );
}
