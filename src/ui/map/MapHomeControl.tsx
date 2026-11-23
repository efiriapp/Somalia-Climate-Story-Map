import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { SOMALIA_BOUNDS } from '../../application/resolve-map-view';

/** House icon shared by the Leaflet and MapLibre Home buttons. */
export const HOME_ICON =
  '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11 12 3l9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg>';

/**
 * Home button under the zoom buttons: shows the whole of Somalia again.
 * Every Leaflet map in the app has one.
 */
export function MapHomeControl({ label }: { label: string }) {
  const map = useMap();

  useEffect(() => {
    const control = new L.Control({ position: 'topleft' });
    control.onAdd = () => {
      const bar = L.DomUtil.create('div', 'leaflet-bar leaflet-control map-home-control');
      const button = L.DomUtil.create('a', '', bar) as HTMLAnchorElement;
      button.href = '#';
      button.role = 'button';
      button.title = label;
      button.setAttribute('aria-label', label);
      button.innerHTML = HOME_ICON;
      L.DomEvent.disableClickPropagation(bar);
      L.DomEvent.on(button, 'click', (event) => {
        L.DomEvent.preventDefault(event);
        map.fitBounds(SOMALIA_BOUNDS, { animate: true });
      });
      return bar;
    };
    control.addTo(map);
    return () => {
      control.remove();
    };
  }, [map, label]);

  return null;
}
