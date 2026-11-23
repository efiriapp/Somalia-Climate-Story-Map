import { useEffect, useState } from 'react';
import { TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import '@maplibre/maplibre-gl-leaflet';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../../application/maplibre-worker';
import { DEFAULT_MAP_LAYER, basemapFor, type MapLayerId } from '../../application/map-layers';
import { satelliteSource } from '../../application/tile-sources';

type Props = {
  basemap?: MapLayerId;
};

let webgl2: boolean | undefined;

/** MapLibre needs WebGL2; some older phones and locked-down browsers lack it. */
export const supportsWebGL2 = (): boolean => {
  if (webgl2 !== undefined) return webgl2;
  try {
    webgl2 = Boolean(document.createElement('canvas').getContext('webgl2'));
  } catch {
    webgl2 = false;
  }
  return webgl2;
};

/** Plain image tiles for browsers without WebGL2 (light traffic only, see tile-sources.ts). */
const RASTER_FALLBACK = {
  streets: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: { url: satelliteSource().url, attribution: satelliteSource().attribution },
} as const;

function VectorBasemap({ basemap, onFail }: { basemap: MapLayerId; onFail: () => void }) {
  const map = useMap();

  useEffect(() => {
    const { style, transform, attribution } = basemapFor(basemap);
    let layer: L.MaplibreGL | null = null;
    try {
      layer = L.maplibreGL({ style });
      // The plugin reads credits from the style's sources only after load and
      // misses later style changes; show the full credit for every layer instead.
      layer.getAttribution = () => attribution;
      layer.addTo(map);
      if (transform && typeof style === 'string') {
        layer
          .getMaplibreMap()
          .setStyle(style, { transformStyle: (_previous, incoming) => transform(incoming) });
      }
    } catch (error) {
      console.warn('Vector basemap unavailable, using image tiles', error);
      try {
        layer?.remove();
      } catch {
        // Layer never finished attaching.
      }
      layer = null;
      onFail();
    }
    return () => {
      layer?.remove();
    };
  }, [map, basemap, onFail]);

  return null;
}

/**
 * Draws the shared free basemap (OpenFreeMap streets, EOX satellite, or
 * hillshaded terrain) inside a Leaflet map, so story maps and the globe use
 * the same sources and credits. Leaflet keeps handling pins and interaction.
 * Falls back to plain image tiles when the browser cannot run MapLibre.
 */
export function LeafletRasterBasemap({ basemap = DEFAULT_MAP_LAYER }: Props) {
  const [vector, setVector] = useState(supportsWebGL2);
  const [onFail] = useState(() => () => setVector(false));

  if (vector) return <VectorBasemap basemap={basemap} onFail={onFail} />;
  const raster = basemap === 'satellite' ? RASTER_FALLBACK.satellite : RASTER_FALLBACK.streets;
  return <TileLayer key={basemap} url={raster.url} attribution={raster.attribution} />;
}
