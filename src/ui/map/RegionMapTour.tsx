import { useCallback, useEffect, useMemo, useRef, useState, type WheelEvent } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SOMALIA_VIEW } from '../../application/resolve-map-view';
import { buildRegionMapTour, type RegionMapStop } from '../../application/region-map-tour';
import { scrollTourIndex } from '../../application/scroll-tour';
import type { Story } from '../../domain/story';

type Props = {
  story: Story;
};

const DISTRICT_ZOOM = 10;
const HOME_FLY_MS = 2800;
const DISTRICT_FLY_MS = 3200;
const SLIDER_HIDE_MS = 3500;

const regionIcon = (label: string) =>
  L.divIcon({
    className: 'region-pin-label active',
    html: `<span>${label}</span>`,
    iconSize: [96, 28],
    iconAnchor: [48, 14],
  });

const flyToSomaliaThenDistrict = (
  map: L.Map,
  stop: RegionMapStop,
  onHome: () => void,
  onArrive: () => void,
): (() => void) => {
  onHome();
  map.flyTo([SOMALIA_VIEW.center.lat, SOMALIA_VIEW.center.lng], SOMALIA_VIEW.zoom, {
    duration: HOME_FLY_MS / 1000,
  });
  let arriveTimer = 0;
  const homeTimer = window.setTimeout(() => {
    map.flyTo([stop.lat, stop.lng], DISTRICT_ZOOM, { duration: DISTRICT_FLY_MS / 1000 });
    arriveTimer = window.setTimeout(onArrive, DISTRICT_FLY_MS);
  }, HOME_FLY_MS);
  return () => {
    window.clearTimeout(homeTimer);
    window.clearTimeout(arriveTimer);
  };
};

function FlyHomeThenDistrict({
  stop,
  onHome,
  onArrive,
}: {
  stop: RegionMapStop;
  onHome: () => void;
  onArrive: () => void;
}) {
  const map = useMap();
  useEffect(() => flyToSomaliaThenDistrict(map, stop, onHome, onArrive), [map, stop, onHome, onArrive]);
  return null;
}

export function RegionMapTour({ story }: Props) {
  const stops = useMemo(() => buildRegionMapTour(story), [story]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pinVisible, setPinVisible] = useState(false);
  const [sliderOpen, setSliderOpen] = useState(false);
  const indexRef = useRef(0);
  const lockedRef = useRef(false);
  const hideRef = useRef(0);
  const hostRef = useRef<HTMLDivElement>(null);
  const activeStop = stops[activeIndex];
  indexRef.current = activeIndex;
  const onHome = useCallback(() => setPinVisible(false), []);
  const onArrive = useCallback(() => setPinVisible(true), []);

  const showSlider = () => {
    setSliderOpen(true);
    window.clearTimeout(hideRef.current);
    hideRef.current = window.setTimeout(() => setSliderOpen(false), SLIDER_HIDE_MS);
  };

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    const next = scrollTourIndex(event.deltaY, indexRef.current, stops.length);
    if (lockedRef.current || next !== null) {
      event.preventDefault();
    }
    showSlider();
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
        showSlider();
        return;
      }
      if (next === null) {
        showSlider();
        return;
      }
      event.preventDefault();
      lockedRef.current = true;
      setActiveIndex(next);
      showSlider();
      window.setTimeout(() => {
        lockedRef.current = false;
      }, HOME_FLY_MS + DISTRICT_FLY_MS);
    };
    node.addEventListener('wheel', handle, { passive: false });
    return () => {
      node.removeEventListener('wheel', handle);
      window.clearTimeout(hideRef.current);
    };
  }, [stops.length]);

  if (!activeStop) {
    return null;
  }

  return (
    <div className="region-map-tour" ref={hostRef} onWheel={onWheel}>
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
          <FlyHomeThenDistrict stop={activeStop} onHome={onHome} onArrive={onArrive} />
          {pinVisible ? (
            <Marker position={[activeStop.lat, activeStop.lng]} icon={regionIcon(activeStop.district)} />
          ) : null}
        </MapContainer>
        {sliderOpen ? (
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
