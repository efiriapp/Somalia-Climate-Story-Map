import { useCallback, useEffect, useMemo, useRef, useState, type WheelEvent } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SOMALIA_VIEW } from '../../application/resolve-map-view';
import {
  HOME_HOLD_MS,
  buildRegionMapTour,
  tourFlightPlan,
  type RegionMapStop,
} from '../../application/region-map-tour';
import { scrollTourIndex } from '../../application/scroll-tour';
import type { Story } from '../../domain/story';

type Props = {
  story: Story;
};

const SLIDER_HIDE_MS = 3500;

const regionIcon = (label: string) =>
  L.divIcon({
    className: 'region-pin-label active',
    html: `<div class="region-pin"><i class="region-pin-marker"></i><span>${label}</span></div>`,
    iconSize: [148, 56],
    iconAnchor: [12, 22],
  });

const jumpSomaliaThenDistrict = (
  map: L.Map,
  stop: RegionMapStop | null,
  onHome: () => void,
  onArrive: () => void,
): (() => void) => {
  map.invalidateSize();
  if (!stop) {
    map.setView([SOMALIA_VIEW.center.lat, SOMALIA_VIEW.center.lng], SOMALIA_VIEW.zoom, { animate: false });
    onHome();
    return () => undefined;
  }
  const [home, district] = tourFlightPlan(stop);
  map.setView([home.lat, home.lng], home.zoom, { animate: false });
  onHome();
  const timer = window.setTimeout(() => {
    map.setView([district.lat, district.lng], district.zoom, { animate: false });
    onArrive();
  }, HOME_HOLD_MS);
  return () => window.clearTimeout(timer);
};

function JumpOnStop({
  stop,
  onHome,
  onArrive,
}: {
  stop: RegionMapStop | null;
  onHome: () => void;
  onArrive: () => void;
}) {
  const map = useMap();
  const primed = useRef(false);
  useEffect(() => {
    if (!stop && !primed.current) {
      return;
    }
    primed.current = true;
    return jumpSomaliaThenDistrict(map, stop, onHome, onArrive);
  }, [map, stop, onHome, onArrive]);
  return null;
}

export function RegionMapTour({ story }: Props) {
  const stops = useMemo(() => buildRegionMapTour(story), [story]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [pinVisible, setPinVisible] = useState(false);
  const [sliderOpen, setSliderOpen] = useState(false);
  const indexRef = useRef(-1);
  const lockedRef = useRef(false);
  const hideRef = useRef(0);
  const hostRef = useRef<HTMLDivElement>(null);
  const activeStop = activeIndex >= 0 ? stops[activeIndex] : undefined;
  indexRef.current = activeIndex;

  const showSlider = useCallback(() => {
    setSliderOpen(true);
    window.clearTimeout(hideRef.current);
    hideRef.current = window.setTimeout(() => setSliderOpen(false), SLIDER_HIDE_MS);
  }, []);

  const onHome = useCallback(() => {
    setPinVisible(false);
    setSliderOpen(false);
    window.clearTimeout(hideRef.current);
  }, []);

  const onArrive = useCallback(() => {
    setPinVisible(true);
    showSlider();
  }, [showSlider]);

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    const next = scrollTourIndex(event.deltaY, indexRef.current, stops.length);
    if (lockedRef.current || next !== null) {
      event.preventDefault();
    }
    if (next === null && !lockedRef.current) {
      showSlider();
    }
  };

  useEffect(() => {
    const node = hostRef.current;
    if (!node) {
      return;
    }
    const handle = (event: globalThis.WheelEvent) => {
      const next = scrollTourIndex(event.deltaY, indexRef.current, stops.length);
      if (lockedRef.current) {
        event.preventDefault();
        return;
      }
      if (next === null) {
        if (indexRef.current >= 0) {
          showSlider();
        }
        return;
      }
      event.preventDefault();
      lockedRef.current = true;
      setActiveIndex(next);
      window.setTimeout(() => {
        lockedRef.current = false;
      }, HOME_HOLD_MS);
    };
    node.addEventListener('wheel', handle, { passive: false, capture: true });
    return () => {
      node.removeEventListener('wheel', handle, true);
      window.clearTimeout(hideRef.current);
    };
  }, [showSlider, stops.length]);

  return (
    <div className="region-map-tour region-map-tour-screen" ref={hostRef} onWheel={onWheel}>
      <div className="map-pane region-map-tour-map">
        <MapContainer
          center={[SOMALIA_VIEW.center.lat, SOMALIA_VIEW.center.lng]}
          zoom={SOMALIA_VIEW.zoom}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <JumpOnStop stop={activeStop ?? null} onHome={onHome} onArrive={onArrive} />
          {pinVisible && activeStop ? (
            <Marker position={[activeStop.lat, activeStop.lng]} icon={regionIcon(activeStop.district)} />
          ) : null}
        </MapContainer>
        {sliderOpen && activeStop ? (
          <aside className="region-slide-card" aria-label={activeStop.title}>
            {activeStop.images[0] ? <img src={activeStop.images[0]} alt="" /> : null}
            <h3>{activeStop.title}</h3>
            <p>{activeStop.description}</p>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
