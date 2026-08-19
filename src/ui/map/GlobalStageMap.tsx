import { useEffect, useMemo, useRef, useState } from 'react';
import { AttributionControl, Map, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
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

export function GlobalStageMap({ stories, onClose }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [ready, setReady] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const events = useMemo(
    () => buildGlobalTour(stories).filter((stop) => stop.kind === 'event'),
    [stories],
  );
  const active = events.find((stop) => stop.storyId === activeId);
  const popup = active ? tourPopupHtml(active) : null;

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
    map.scrollZoom.disable();
    map.addControl(new AttributionControl({ compact: true }), 'bottom-left');
    mapRef.current = map;
    const onLoad = () => {
      applyGlobe(map);
      map.resize();
      setReady(true);
    };
    map.on('load', onLoad);
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
    const node = host.current;
    if (!node) {
      return;
    }
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (events.length === 0) {
        return;
      }
      const delta = event.deltaY > 0 ? 1 : -1;
      setActiveId((current) => {
        const index = events.findIndex((stop) => stop.storyId === current);
        const from = index < 0 ? (delta > 0 ? -1 : 0) : index;
        const next = delta > 0 ? nextTourIndex(from, events.length) : prevTourIndex(Math.max(from, 0));
        return events[next]?.storyId ?? current;
      });
    };
    node.addEventListener('wheel', onWheel, { passive: false });
    return () => node.removeEventListener('wheel', onWheel);
  }, [events]);

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
      pin.addEventListener('click', () => {
        if (stop.storyId) {
          setActiveId(stop.storyId);
        }
      });
      return marker;
    });
  }, [events, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !active) {
      return;
    }
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
