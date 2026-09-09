import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { maplibreGL } from '@maplibre/maplibre-gl-leaflet';
import { EqualEarthCoordTransform } from 'maplibre-gl-equal-earth';
import {
  EQUAL_EARTH_SWITCH_ZOOM,
  equalEarthStyle,
} from '../../application/equal-earth';
import { DEFAULT_MAP_LAYER, type MapLayerId } from '../../application/map-layers';
import 'maplibre-gl/dist/maplibre-gl.css';

type Props = {
  basemap?: MapLayerId;
};

/** Shared Equal Earth hybrid basemap for every Leaflet map surface. Streets is the default. */
export function EqualEarthBasemap({ basemap = DEFAULT_MAP_LAYER }: Props) {
  const map = useMap();
  const layerRef = useRef<ReturnType<typeof maplibreGL> | null>(null);
  const basemapRef = useRef(basemap);
  const readyRef = useRef(false);
  basemapRef.current = basemap;

  useEffect(() => {
    const layer = maplibreGL({ style: equalEarthStyle(basemapRef.current) });
    layer.addTo(map);
    new EqualEarthCoordTransform(layer.getMaplibreMap(), EQUAL_EARTH_SWITCH_ZOOM);
    layerRef.current = layer;
    readyRef.current = true;
    return () => {
      readyRef.current = false;
      map.removeLayer(layer);
      layerRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    if (!readyRef.current) {
      return;
    }
    const libre = layerRef.current?.getMaplibreMap();
    if (!libre) {
      return;
    }
    if (libre.getStyle()?.name === `equal-earth-${basemap}`) {
      return;
    }
    libre.setStyle(equalEarthStyle(basemap));
  }, [basemap]);

  return null;
}
