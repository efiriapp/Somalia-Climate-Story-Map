import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import type { FeatureCollection, Position } from 'geojson';

type Props = {
  /** Map pane to clip (made with react-leaflet's <Pane>). */
  pane: string;
  outline: FeatureCollection;
};

/** Outer and inner rings of every polygon in the outline. */
const ringsOf = (outline: FeatureCollection): Position[][] =>
  outline.features.flatMap((feature) => {
    const g = feature.geometry;
    if (g.type === 'Polygon') return g.coordinates;
    if (g.type === 'MultiPolygon') return g.coordinates.flat();
    return [];
  });

/**
 * Shows a pane's layers only inside the outline (e.g. Somalia), by clipping
 * the pane with a CSS path in map layer pixels. The path is redrawn after
 * each zoom; panning needs nothing, since the pane moves with the map.
 */
export function ClipToOutline({ pane, outline }: Props) {
  const map = useMap();

  useEffect(() => {
    const element = map.getPane(pane);
    if (!element) return;
    const rings = ringsOf(outline);
    const update = () => {
      const d = rings
        .map((ring) => {
          const points = ring.map(([lng, lat]) => {
            const p = map.latLngToLayerPoint([lat!, lng!]);
            return `${Math.round(p.x)} ${Math.round(p.y)}`;
          });
          // Zoomed out, many points round to the same pixel: keep one.
          return 'M' + points.filter((point, i) => point !== points[i - 1]).join('L') + 'Z';
        })
        .join('');
      element.style.clipPath = `path(evenodd, '${d}')`;
    };
    update();
    map.on('zoomend viewreset resize', update);
    return () => {
      map.off('zoomend viewreset resize', update);
      element.style.clipPath = '';
    };
  }, [map, pane, outline]);

  return null;
}
