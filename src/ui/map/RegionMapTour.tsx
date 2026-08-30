import { useEffect, useMemo, useRef, useState, type WheelEvent } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { nextTourIndex, prevTourIndex } from '../../application/global-tour';
import { SOMALIA_VIEW } from '../../application/resolve-map-view';
import { buildRegionMapTour, type RegionMapStop } from '../../application/region-map-tour';
import { scrollTourIndex } from '../../application/scroll-tour';
import type { Story } from '../../domain/story';

type Props = {
  story: Story;
};

const DISTRICT_ZOOM = 10;

const regionIcon = (label: string) =>
  L.divIcon({
    className: 'region-pin-label active',
    html: `<span>${label}</span>`,
    iconSize: [96, 28],
    iconAnchor: [48, 14],
  });

function FlyToDistrict({ stop }: { stop: RegionMapStop }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([stop.lat, stop.lng], DISTRICT_ZOOM, { duration: 1.1 });
  }, [map, stop]);
  return null;
}

export function RegionMapTour({ story }: Props) {
  const stops = useMemo(() => buildRegionMapTour(story), [story]);
  const [activeIndex, setActiveIndex] = useState(0);
  const indexRef = useRef(0);
  const lockedRef = useRef(false);
  const hostRef = useRef<HTMLDivElement>(null);
  const activeStop = stops[activeIndex];
  indexRef.current = activeIndex;

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    const next = scrollTourIndex(event.deltaY, indexRef.current, stops.length);
    if (next === null || lockedRef.current) {
      return;
    }
    event.preventDefault();
    lockedRef.current = true;
    setActiveIndex(next);
    window.setTimeout(() => {
      lockedRef.current = false;
    }, 450);
  };

  useEffect(() => {
    const node = hostRef.current;
    if (!node) {
      return;
    }
    const handle = (event: globalThis.WheelEvent) => {
      const next = scrollTourIndex(event.deltaY, indexRef.current, stops.length);
      if (next === null || lockedRef.current) {
        return;
      }
      event.preventDefault();
      lockedRef.current = true;
      setActiveIndex(next);
      window.setTimeout(() => {
        lockedRef.current = false;
      }, 450);
    };
    node.addEventListener('wheel', handle, { passive: false });
    return () => node.removeEventListener('wheel', handle);
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
          <FlyToDistrict stop={activeStop} />
          <Marker position={[activeStop.lat, activeStop.lng]} icon={regionIcon(activeStop.district)} />
        </MapContainer>
        <div className="tour-right-stack">
          <aside className="event-slider">
            {stops.map((slide, index) => (
              <article
                key={slide.regionSlug}
                className={
                  index === activeIndex
                    ? 'event-card event-card-slide active'
                    : 'event-card event-card-slide hide'
                }
                aria-hidden={index !== activeIndex}
                aria-label={slide.title}
              >
                {index === activeIndex ? (
                  <>
                    {activeStop.images[0] ? <img src={activeStop.images[0]} alt="" /> : null}
                    <h3>{activeStop.title}</h3>
                    <p>{activeStop.description}</p>
                  </>
                ) : (
                  <>
                    {slide.images[0] ? <img src={slide.images[0]} alt="" /> : null}
                    <h3>{slide.title}</h3>
                    <p>{slide.description}</p>
                  </>
                )}
              </article>
            ))}
            <div className="region-map-nav">
              <button type="button" onClick={() => setActiveIndex(prevTourIndex(activeIndex))}>
                Back
              </button>
              <button type="button" onClick={() => setActiveIndex(nextTourIndex(activeIndex, stops.length))}>
                Next
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
