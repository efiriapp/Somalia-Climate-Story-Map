import { CircleMarker, MapContainer, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LeafletRasterBasemap } from '../map/LeafletRasterBasemap';
import { STATUS_COLOR, type StatusTone } from './StatusBadge';

export type WatchMapPoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  tone: StatusTone;
  /** Status label and value, shown with the name. */
  detail: string;
};

/** South-west and north-east corners of Somalia, so the whole country fits. */
const SOMALIA_BOUNDS: [[number, number], [number, number]] = [
  [-1.8, 40.9],
  [12.1, 51.5],
];

/** Somalia overview map with one status-coloured marker per station or town. */
export function WatchMap({ points, label }: { points: WatchMapPoint[]; label: string }) {
  return (
    <div className="watch-map" role="region" aria-label={label}>
      <MapContainer bounds={SOMALIA_BOUNDS} minZoom={4} maxZoom={10} scrollWheelZoom={false}>
        <LeafletRasterBasemap />
        {points.map((point) => (
          <CircleMarker
            key={point.id}
            center={[point.lat, point.lng]}
            radius={8}
            pathOptions={{ color: '#ffffff', weight: 2, fillColor: STATUS_COLOR[point.tone], fillOpacity: 1 }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              <strong>{point.name}</strong>
              <br />
              {point.detail}
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
