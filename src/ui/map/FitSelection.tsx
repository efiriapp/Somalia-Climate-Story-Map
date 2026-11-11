import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { SOMALIA_BOUNDS, type LatLngBoundsTuple } from '../../application/resolve-map-view';

type Props = {
  /** Area to zoom to, or null to show the whole of Somalia. */
  bounds: LatLngBoundsTuple | null;
  /** Changes when the user changes what is shown (river, town, flood...). */
  selectionKey: string;
  maxZoom?: number;
};

/**
 * Every map opens on the whole of Somalia. When the user narrows the
 * selection, the map zooms to it; when the selection goes back to "all",
 * the map returns to Somalia.
 */
export function FitSelection({ bounds, selectionKey, maxZoom = 11 }: Props) {
  const map = useMap();
  const lastKey = useRef<string | null>(null);
  const boundsKey = bounds ? bounds.flat().join(',') : 'somalia';

  useEffect(() => {
    const changed = lastKey.current !== null && lastKey.current !== selectionKey;
    lastKey.current = selectionKey;
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom, animate: true });
    } else if (changed) {
      // The map opened on Somalia already; only move back when the user asks.
      map.fitBounds(SOMALIA_BOUNDS, { animate: true });
    }
    // bounds is compared by value through boundsKey.
  }, [map, selectionKey, boundsKey, maxZoom]);

  return null;
}
