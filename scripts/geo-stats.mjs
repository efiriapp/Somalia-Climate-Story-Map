/**
 * Small geometry helpers for raster statistics in the data scripts.
 */

const EARTH_RADIUS_M = 6371007.2; // authalic sphere: equal-area
const RAD = Math.PI / 180;

/** Ground area in hectares of a square pixel `size` degrees wide, centred at `lat`. */
export const pixelAreaHa = (lat, size) => {
  const south = (lat - size / 2) * RAD;
  const north = (lat + size / 2) * RAD;
  return (EARTH_RADIUS_M ** 2 * size * RAD * (Math.sin(north) - Math.sin(south))) / 10000;
};

const inRing = (ring, x, y) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};

/** Polygon = outer ring then holes. */
const inPolygon = (rings, x, y) => inRing(rings[0], x, y) && !rings.slice(1).some((hole) => inRing(hole, x, y));

/**
 * Returns a function (lng, lat) -> id of the feature that contains the point,
 * or null when it is in none of them.
 */
export const makeLocator = (features, idOf) => {
  const parts = features.flatMap((feature) => {
    const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
    return polygons.map((rings) => {
      const xs = rings[0].map((p) => p[0]);
      const ys = rings[0].map((p) => p[1]);
      return { id: idOf(feature), rings, box: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)] };
    });
  });
  let last = null; // neighbouring pixels are usually in the same unit
  return (x, y) => {
    const fits = (part) =>
      x >= part.box[0] && x <= part.box[2] && y >= part.box[1] && y <= part.box[3] && inPolygon(part.rings, x, y);
    if (last && fits(last)) return last.id;
    const hit = parts.find(fits) ?? null;
    if (hit) last = hit;
    return hit ? hit.id : null;
  };
};
