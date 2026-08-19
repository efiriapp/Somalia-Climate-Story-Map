import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AttributionControl, Map, Marker, NavigationControl, type GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { searchTourStops } from '../../application/continent-visits';
import { distanceKm, type LngLat } from '../../application/flight-path';
import {
  buildGlobalTour,
  GLOBE_PADDING,
  GLOBE_VIEW,
  nextTourIndex,
  prevTourIndex,
  tourPopupHtml,
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

export function GlobalStageMap({ stories, onClose }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const jumpRef = useRef(false);
  const measuringRef = useRef(false);
  const measurePointsRef = useRef<LngLat[]>([]);
  const [ready, setReady] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [measuring, setMeasuring] = useState(false);
  const [measureKm, setMeasureKm] = useState<number | null>(null);
  const events = useMemo(
    () => buildGlobalTour(stories).filter((stop) => stop.kind === 'event'),
    [stories],
  );
  const active = events.find((stop) => stop.storyId === activeId);
  const popup = active ? tourPopupHtml(active) : null;
  const searchHits = useMemo(() => searchTourStops(events, searchQuery), [events, searchQuery]);

  const stepEvent = (delta: number) => {
    if (events.length === 0) {
      return;
    }
    const index = events.findIndex((stop) => stop.storyId === activeId);
    const from = index < 0 ? (delta > 0 ? -1 : 0) : index;
    const next = delta > 0 ? nextTourIndex(from, events.length) : prevTourIndex(Math.max(from, 0));
    const storyId = events[next]?.storyId;
    if (!storyId) {
      return;
    }
    jumpRef.current = true;
    setActiveId(storyId);
  };

  const goHome = () => {
    const map = mapRef.current;
    jumpRef.current = false;
    setActiveId(null);
    setSearchOpen(false);
    setMeasuring(false);
    measurePointsRef.current = [];
    setMeasureKm(null);
    const source = map?.getSource('measure-line') as GeoJSONSource | undefined;
    source?.setData(emptyLine);
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
      source?.setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: next.map((item) => [item.lng, item.lat]) },
      });
      setMeasureKm(next.length === 2 ? distanceKm(next[0], next[1]) : null);
    };
    map.on('load', onLoad);
    map.on('click', onClick);
    const fitScreen = () => map.resize();
    window.addEventListener('resize', fitScreen);
    return () => {
      window.removeEventListener('resize', fitScreen);
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) {
      return;
    }
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = events.map((stop) => {
      const marker = new Marker({ color: '#2E7D57' }).setLngLat([stop.lng, stop.lat]).addTo(map);
      const pin = marker.getElement();
      pin.style.cursor = 'pointer';
      const open = (event: Event) => {
        event.stopPropagation();
        if (measuringRef.current || !stop.storyId) {
          return;
        }
        jumpRef.current = false;
        setActiveId(stop.storyId);
      };
      pin.addEventListener('mouseenter', open);
      pin.addEventListener('click', open);
      return marker;
    });
  }, [events, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !active || !jumpRef.current) {
      return;
    }
    jumpRef.current = false;
    map.easeTo({
      center: [active.lng, active.lat],
      zoom: 4.4,
      pitch: 28,
      bearing: 8,
      duration: 1800,
    });
  }, [active, ready]);

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
                      if (!hit.storyId) {
                        return;
                      }
                      jumpRef.current = true;
                      setActiveId(hit.storyId);
                      setSearchOpen(false);
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
        {popup ? (
          <article className="tour-popup-card" aria-label="Selected ICE global event">
            <button
              type="button"
              className="tour-popup-close"
              aria-label="Close event"
              onClick={() => setActiveId(null)}
            >
              ×
            </button>
            <div dangerouslySetInnerHTML={{ __html: popup }} />
          </article>
        ) : null}
      </div>
    </section>
  );
}
