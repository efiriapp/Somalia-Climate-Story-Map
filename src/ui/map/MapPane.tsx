import { MapContainer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { displayLocation, groupedPins } from '../../application/display-location';
import type { MapView } from '../../application/resolve-map-view';
import type { Story } from '../../domain/story';
import { EqualEarthBasemap } from './EqualEarthBasemap';

const pinIcon = L.divIcon({
  className: 'ice-pin',
  html: '<span style="display:block;width:16px;height:16px;border-radius:50%;background:#4CAF7D;border:2px solid #063D39"></span>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

type Props = {
  stories: Story[];
  view: MapView;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function MapPane({ stories, view, selectedId, onSelect }: Props) {
  const groups = groupedPins(stories);
  const viewKey = `${view.center.lat}-${view.center.lng}-${view.zoom}`;

  return (
    <div className="map-pane">
      <MapContainer
        key={viewKey}
        center={[view.center.lat, view.center.lng]}
        zoom={view.zoom}
        scrollWheelZoom
        minZoom={1}
      >
        <EqualEarthBasemap />
        {[...groups.values()].flatMap((group) =>
          group.map((story) => {
            const point = displayLocation(story, group);
            return (
              <Marker
                key={story.id}
                position={[point.lat, point.lng]}
                icon={pinIcon}
                eventHandlers={{ click: () => onSelect(story.id) }}
              >
                <Popup>
                  <strong>{story.title}</strong>
                  {selectedId === story.id ? <p>Selected</p> : null}
                </Popup>
              </Marker>
            );
          }),
        )}
      </MapContainer>
    </div>
  );
}
