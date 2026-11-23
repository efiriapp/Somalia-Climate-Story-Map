import { useState } from 'react';
import { MapContainer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { displayLocation, groupedPins } from '../../application/display-location';
import { DEFAULT_MAP_LAYER, type MapLayerId } from '../../application/map-layers';
import type { MapView } from '../../application/resolve-map-view';
import type { Story } from '../../domain/story';
import { useOptionalAutoplay } from '../chrome/AutoplayContext';
import { LeafletRasterBasemap } from './LeafletRasterBasemap';
import { MapHomeControl } from './MapHomeControl';
import { useLocale } from '../chrome/LocaleContext';
import { MapBasemapControl } from './MapBasemapControl';

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
  const [basemap, setBasemap] = useState<MapLayerId>(DEFAULT_MAP_LAYER);
  const [layersOpen, setLayersOpen] = useState(false);
  const { copy } = useLocale();
  const autoplay = useOptionalAutoplay();

  const pauseAutoplay = () => autoplay?.pause();

  return (
    <div className="map-pane" onWheel={pauseAutoplay} onPointerDown={pauseAutoplay}>
      <MapContainer
        key={viewKey}
        center={[view.center.lat, view.center.lng]}
        zoom={view.zoom}
        scrollWheelZoom
        minZoom={1}
      >
        <LeafletRasterBasemap basemap={basemap} />
        <MapHomeControl label={copy.mapHome} />
        {[...groups.values()].flatMap((group) =>
          group.map((story) => {
            const point = displayLocation(story, group);
            return (
              <Marker
                key={story.id}
                position={[point.lat, point.lng]}
                icon={pinIcon}
                eventHandlers={{
                  click: () => {
                    pauseAutoplay();
                    onSelect(story.id);
                  },
                }}
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
      <MapBasemapControl
        className="map-basemap-control-leaflet"
        value={basemap}
        open={layersOpen}
        onOpenChange={setLayersOpen}
        onChange={setBasemap}
      />
    </div>
  );
}
