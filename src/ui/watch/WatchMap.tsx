import { useEffect, useRef, type ReactNode } from 'react';
import { CircleMarker, MapContainer, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LeafletRasterBasemap } from '../map/LeafletRasterBasemap';
import { FullscreenButton, MapAutoResize, useFullscreen } from '../map/MapFullscreen';
import { MapHomeControl } from '../map/MapHomeControl';
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
  /** Optional side panel shown on the map (right side; below the map on phones). */
  side?: ReactNode;
  /** Highlighted point, e.g. the chosen town: outlined and labelled by name. */
  selectedId?: string | null;
  /** Called when a marker is clicked. */
  onSelect?: (id: string) => void;
  /** When true, the map zooms to the points shown whenever they change. */
  fitToPoints?: boolean;
};

/** Zooms to the shown points: one point at town zoom, several to fit them all. */
function FitPoints({ points }: { points: WatchMapPoint[] }) {
  const map = useMap();
  const key = points.map((point) => point.id).join(',');
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.setView([points[0]!.lat, points[0]!.lng], 9, { animate: true });
      return;
    }
    map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number])), {
      padding: [60, 60],
      maxZoom: 8,
      animate: true,
    });
    // Refit only when the set of points changes.
  }, [map, key]);
  return null;
}

/** Somalia overview map: status-coloured markers, full width, with full screen and home. */
export function WatchMap({ points, label, controls, side, selectedId, onSelect, fitToPoints }: Props) {
  const { copy } = useLocale();
  const wrap = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(wrap);

  return (
    <div className={side ? 'watch-map map-bleed has-side' : 'watch-map map-bleed'} role="region" aria-label={label} ref={wrap}>
      <div className="watch-map-stage">
        <MapContainer bounds={SOMALIA_BOUNDS} minZoom={4} maxZoom={12} scrollWheelZoom={false}>
          <LeafletRasterBasemap />
          <MapAutoResize />
          <MapHomeControl label={copy.mapHome} bounds={SOMALIA_BOUNDS} />
          {fitToPoints ? <FitPoints points={points} /> : null}
          {points.map((point) => {
            const chosen = point.id === selectedId;
            // A tooltip cannot switch to permanent after it is created, so the
            // marker is recreated when its label mode changes.
            const labelled = chosen || points.length <= 4;
            return (
              <CircleMarker
                key={`${point.id}-${chosen}-${labelled}`}
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
                <Tooltip
                  direction="top"
                  offset={[0, chosen ? -10 : -6]}
                  permanent={labelled}
                  className={chosen ? 'map-label map-label-chosen' : 'map-label'}
                >
                  <strong>{point.name}</strong>
                  {chosen ? (
                    <>
                      <br />
                      {point.detail}
                    </>
                  ) : null}
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
      {side ? <aside className="watch-map-side">{side}</aside> : null}
    </div>
  );
}
