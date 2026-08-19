import { useEffect, useMemo, useRef, useState } from 'react';
import { AttributionControl, Map, Marker, NavigationControl, Popup } from 'maplibre-gl';
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
  const popupRef = useRef<Popup | null>(null);
  const jumpRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const events = useMemo(
    () => buildGlobalTour(stories).filter((stop) => stop.kind === 'event'),
    [stories],
  );
  const active = events.find((stop) => stop.storyId === activeId);

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
    map.addControl(new NavigationControl({ visualizePitch: true }), 'top-right');
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
      popupRef.current?.remove();
      popupRef.current = null;
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
      const open = () => {
        if (stop.storyId) {
          jumpRef.current = false;
          setActiveId(stop.storyId);
        }
      };
      pin.addEventListener('mouseenter', open);
      pin.addEventListener('click', open);
      return marker;
    });
  }, [events, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) {
      return;
    }
    popupRef.current?.remove();
    popupRef.current = null;
    if (!active) {
      return;
    }
    const html = tourPopupHtml(active);
    if (!html) {
      return;
    }
    const popup = new Popup({
      closeButton: true,
      closeOnClick: false,
      maxWidth: '320px',
      offset: 28,
      className: 'tour-map-popup',
    })
      .setLngLat([active.lng, active.lat])
      .setHTML(html)
      .addTo(map);
    popup.on('close', () => {
      setActiveId((current) => (current === active.storyId ? null : current));
    });
    popupRef.current = popup;
    return () => {
      popup.remove();
      if (popupRef.current === popup) {
        popupRef.current = null;
      }
    };
  }, [active, ready]);

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
        <div className="tour-event-nav">
          <button type="button" aria-label="Previous event" onClick={() => stepEvent(-1)}>
            Previous
          </button>
          <button type="button" aria-label="Next event" onClick={() => stepEvent(1)}>
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
