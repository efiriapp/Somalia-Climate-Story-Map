import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { nextTourIndex, prevTourIndex } from '../../application/global-tour';
import { SOMALIA_VIEW } from '../../application/resolve-map-view';
import { buildRegionMapTour, type RegionMapStop } from '../../application/region-map-tour';
import type { Story } from '../../domain/story';

type Props = {
  story: Story;
};

const REGION_ZOOM = 7;

const regionIcon = (label: string, active: boolean) =>
  L.divIcon({
    className: active ? 'region-pin-label active' : 'region-pin-label',
    html: `<span>${label}</span>`,
    iconSize: [96, 28],
    iconAnchor: [48, 14],
  });

function FlyToRegion({ stop }: { stop: RegionMapStop }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([stop.lat, stop.lng], REGION_ZOOM, { duration: 1.1 });
  }, [map, stop]);
  return null;
}

export function RegionMapTour({ story }: Props) {
  const stops = useMemo(() => buildRegionMapTour(story), [story]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeStop = stops[activeIndex];

  if (!activeStop) {
    return null;
  }

  return (
    <div className="region-map-tour">
      <div className="map-pane region-map-tour-map">
        <MapContainer
          center={[SOMALIA_VIEW.center.lat, SOMALIA_VIEW.center.lng]}
          zoom={SOMALIA_VIEW.zoom}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FlyToRegion stop={activeStop} />
          {stops.map((stop, index) => (
            <Marker
              key={stop.regionSlug}
              position={[stop.lat, stop.lng]}
              icon={regionIcon(stop.region, index === activeIndex)}
              eventHandlers={{ click: () => setActiveIndex(index) }}
            />
          ))}
        </MapContainer>
        <div className="tour-right-stack">
          <aside className="event-slider">
            <article className="event-card active" aria-label={activeStop.title}>
              {activeStop.images[0] ? <img src={activeStop.images[0]} alt="" /> : null}
              <h3>{activeStop.title}</h3>
              <p>{activeStop.description}</p>
            </article>
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
