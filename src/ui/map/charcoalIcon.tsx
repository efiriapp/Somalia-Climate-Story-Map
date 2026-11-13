import L from 'leaflet';

/** Charcoal icon: a flame over an earth kiln (24 × 24). One drawing for pins and legends. */
const FLAME =
  'M12 2.5c1.6 2.4 3.6 3.9 3.6 6.7a3.6 3.6 0 0 1-7.2 0c0-1.7 1-3 1.9-3.9.2 1.3.9 2 1.8 2.4.3-1.7.2-3.3-.1-5.2z';
const KILN = 'M3.5 20c0-3.9 3.8-6.6 8.5-6.6s8.5 2.7 8.5 6.6z';
const PIN = 'M15 1C7.3 1 1 7 1 14.5 1 24 15 39 15 39s14-15 14-24.5C29 7 22.7 1 15 1z';

/** The charcoal icon in a legend or layer list, in the given colour. */
export function CharcoalGlyph({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" style={{ flex: 'none' }}>
      <path d={KILN} fill={color} />
      <path d={FLAME} fill={color} />
    </svg>
  );
}

/** Map pin with the white charcoal icon, filled with the area's colour. */
export const charcoalPinIcon = (color: string): L.DivIcon =>
  L.divIcon({
    className: 'charcoal-pin',
    html:
      `<svg viewBox="0 0 30 40" width="30" height="40" aria-hidden="true">` +
      `<path d="${PIN}" fill="${color}" stroke="#fff" stroke-width="2"/>` +
      `<g transform="translate(5.4 3.6) scale(0.8)" fill="#fff"><path d="${KILN}"/><path d="${FLAME}"/></g>` +
      `</svg>`,
    iconSize: [30, 40],
    iconAnchor: [15, 39],
    tooltipAnchor: [0, -34],
  });
