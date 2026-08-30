import { useCallback, useEffect, useMemo, useRef, useState, type WheelEvent } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SOMALIA_VIEW } from '../../application/resolve-map-view';
import {
  DISTRICT_FLY_MS,
  HOME_FLY_MS,
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

const regionIcon = () =>
  L.divIcon({
    className: 'modern-pin-wrap',
    html: `<span class="modern-pin"><i class="region-pin-marker"></i></span>`,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -36],
  });

const flyToSomaliaThenDistrict = (
  map: L.Map,
  stop: RegionMapStop | null,
  onHome: () => void,
  onArrive: () => void,
): (() => void) => {
  map.invalidateSize();
  map.stop();
  if (!stop) {
    map.flyTo([SOMALIA_VIEW.center.lat, SOMALIA_VIEW.center.lng], SOMALIA_VIEW.zoom, {
      duration: HOME_FLY_MS / 1000,
      easeLinearity: 0.12,
    });
    onHome();
    return () => undefined;
  }
  const [home, district] = tourFlightPlan(stop);
  onHome();
  map.flyTo([home.lat, home.lng], home.zoom, {
    duration: home.durationMs / 1000,
    easeLinearity: 0.12,
  });
  let arriveTimer = 0;
  const homeTimer = window.setTimeout(() => {
    map.flyTo([district.lat, district.lng], district.zoom, {
      duration: district.durationMs / 1000,
      easeLinearity: 0.12,
    });
    arriveTimer = window.setTimeout(onArrive, district.durationMs);
  }, home.durationMs);
  return () => {
    window.clearTimeout(homeTimer);
    window.clearTimeout(arriveTimer);
  };
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
    return flyToSomaliaThenDistrict(map, stop, onHome, onArrive);
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
      }, HOME_FLY_MS + DISTRICT_FLY_MS);
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
            <Marker position={[activeStop.lat, activeStop.lng]} icon={regionIcon()}>
              <Popup className="region-pin-popup">
                <strong>{activeStop.district}</strong>
                <p>{activeStop.title}</p>
              </Popup>
            </Marker>
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
