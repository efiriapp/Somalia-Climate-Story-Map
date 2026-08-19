import { useEffect, useMemo, useRef, useState } from 'react';
import { AttributionControl, Map, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { buildGlobalTour, GLOBE_VIEW } from '../../application/global-tour';
import { styleForLayer } from '../../application/map-layers';
import type { Story } from '../../domain/story';
import { EventSlider } from './EventSlider';

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
    map.setPadding({ top: 56, bottom: 24, left: 16, right: 340 });
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
    const stop = events.find((item) => item.storyId === activeId);
    if (!map || !ready || !stop) {
      return;
    }
    map.easeTo({
      center: [stop.lng, stop.lat],
      zoom: 4.4,
      pitch: 28,
      bearing: 8,
      duration: 1800,
    });
  }, [activeId, events, ready]);

  return (
    <section className="global-stage" aria-label="ICE Institute at Global Stage">
      <div className="global-stage-scene">
        <div className="global-stage-map" ref={host} />
        <h1 className="tour-title">ICE Institute at Global Stage</h1>
        <button type="button" className="tour-back simple" aria-label="Back to main" onClick={onClose}>
          Back to main
        </button>
        <div className="tour-right-stack">
          <EventSlider stops={events} activeStoryId={activeId} onSelect={setActiveId} />
        </div>
      </div>
    </section>
  );
}
