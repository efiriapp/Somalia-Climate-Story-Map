import { useRef, type ReactNode } from 'react';
import { CircleMarker, MapContainer, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LeafletRasterBasemap } from '../map/LeafletRasterBasemap';
import { FullscreenButton, MapAutoResize, useFullscreen } from '../map/MapFullscreen';
import { useLocale } from '../chrome/LocaleContext';
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

type Props = {
  points: WatchMapPoint[];
  label: string;
  /** Optional controls shown on the map (top-left, beside the zoom buttons). */
  controls?: ReactNode;
  /** Highlighted point, e.g. the chosen town. */
  selectedId?: string | null;
  /** Called when a marker is clicked. */
  onSelect?: (id: string) => void;
};

/** Somalia overview map: one status-coloured marker per station or town, full width, with full screen. */
export function WatchMap({ points, label, controls, selectedId, onSelect }: Props) {
  const { copy } = useLocale();
  const wrap = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(wrap);

  return (
    <div className="watch-map map-bleed" role="region" aria-label={label} ref={wrap}>
      <MapContainer bounds={SOMALIA_BOUNDS} minZoom={4} maxZoom={10} scrollWheelZoom={false}>
        <LeafletRasterBasemap />
        <MapAutoResize />
        {points.map((point) => {
          const chosen = point.id === selectedId;
          return (
            <CircleMarker
              key={`${point.id}-${chosen}`}
              center={[point.lat, point.lng]}
              radius={chosen ? 11 : 8}
              pathOptions={{
                color: chosen ? '#063D39' : '#ffffff',
                weight: chosen ? 3 : 2,
                fillColor: STATUS_COLOR[point.tone],
                fillOpacity: 1,
              }}
              eventHandlers={onSelect ? { click: () => onSelect(point.id) } : undefined}
            >
              <Tooltip direction="top" offset={[0, -6]}>
                <strong>{point.name}</strong>
                <br />
                {point.detail}
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
      {controls ? <div className="map-overlay-controls">{controls}</div> : null}
      <div className="map-corner-tools">
        <FullscreenButton
          on={fullscreen.on}
          onToggle={fullscreen.toggle}
          labels={{ enter: copy.mapFullscreen, exit: copy.mapFullscreenExit }}
        />
      </div>
    </div>
  );
}
