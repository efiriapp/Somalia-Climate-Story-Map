import { useRef, type ReactNode } from 'react';
import { CircleMarker, MapContainer, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LeafletRasterBasemap } from '../map/LeafletRasterBasemap';
import { FullscreenButton, MapAutoResize, useFullscreen } from '../map/MapFullscreen';
import { MapHomeControl } from '../map/MapHomeControl';
import { FitSelection } from '../map/FitSelection';
import { SOMALIA_BOUNDS, boundsOf } from '../../application/resolve-map-view';
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
  /** Optional legend or layer list on the map (bottom-left). */
  legend?: ReactNode;
  /** Side panel beside the map (2/3 map, 1/3 panel) instead of over it. */
  sideBeside?: boolean;
  /** Extra map layers (tiles, boundaries) drawn under the points. */
  children?: ReactNode;
  /** When true, the map zooms to the points; when false it shows all of Somalia. */
  fitToPoints?: boolean;
};

/** Somalia overview map: status-coloured markers, full width, with full screen and home. */
export function WatchMap({
  points,
  label,
  controls,
  side,
  legend,
  sideBeside,
  selectedId,
  onSelect,
  fitToPoints,
  children,
}: Props) {
  const { copy } = useLocale();
  const wrap = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(wrap);

  return (
    <div
      className={['watch-map map-bleed', side ? 'has-side' : '', side && sideBeside ? 'side-beside' : ''].join(' ').trim()}
      role="region"
      aria-label={label}
      ref={wrap}
    >
      <div className="watch-map-stage">
        <MapContainer bounds={SOMALIA_BOUNDS} minZoom={4} maxZoom={12} scrollWheelZoom={false}>
          <LeafletRasterBasemap />
          <MapAutoResize />
          <MapHomeControl label={copy.mapHome} />
          <FitSelection
            bounds={fitToPoints ? boundsOf(points) : null}
            selectionKey={`${fitToPoints}:${points.map((point) => point.id).join(',')}`}
            maxZoom={9}
          />
          {children}
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
        {legend ? <div className="map-overlay-legend">{legend}</div> : null}
        <div className="map-corner-tools">
          <FullscreenButton
            on={fullscreen.on}
            onToggle={fullscreen.toggle}
            labels={{ enter: copy.mapFullscreen, exit: copy.mapFullscreenExit }}
          />
        </div>
      </div>
      {side ? sideBeside ? side : <aside className="watch-map-side">{side}</aside> : null}
    </div>
  );
}
