import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { maplibreGL } from '@maplibre/maplibre-gl-leaflet';
import { EqualEarthCoordTransform } from 'maplibre-gl-equal-earth';
import {
  EQUAL_EARTH_STYLE_URL,
  EQUAL_EARTH_SWITCH_ZOOM,
} from '../../application/equal-earth';
import 'maplibre-gl/dist/maplibre-gl.css';

/** Shared Equal Earth basemap for every Leaflet map surface. */
export function EqualEarthBasemap() {
  const map = useMap();

  useEffect(() => {
    const layer = maplibreGL({ style: EQUAL_EARTH_STYLE_URL });
    layer.addTo(map);
    const libre = layer.getMaplibreMap();
    new EqualEarthCoordTransform(libre, EQUAL_EARTH_SWITCH_ZOOM);
    return () => {
      map.removeLayer(layer);
    };
  }, [map]);

  return null;
}
