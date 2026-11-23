import { useState } from 'react';
import { GeoJSON, Marker, useMap, useMapEvents } from 'react-leaflet';
import type { Feature, FeatureCollection } from 'geojson';
import L, { type PathOptions } from 'leaflet';
import type { AdminLevel } from '../../application/flood-history';

/** UNOCHA boundary files in public/data/watch (made by scripts/flood-areas.mjs). */
export const ADMIN_FILE: Record<AdminLevel, string> = {
  state: 'admin-states.geojson',
  region: 'admin-regions.geojson',
  district: 'admin-districts.geojson',
};

/** Outlines: states bold, regions thin, districts finest. */
const ADMIN_STYLE: Record<AdminLevel, PathOptions> = {
  state: { color: '#063D39', weight: 2, dashArray: '7 4', opacity: 0.85, fill: false },
  region: { color: '#3d3d3a', weight: 1.2, opacity: 0.7, fill: false },
  district: { color: '#6b6a66', weight: 0.7, dashArray: '2 3', opacity: 0.7, fill: false },
};

/** Label size in px at zoom 5, and the largest it grows to. */
const LABEL_SIZE: Record<AdminLevel, { base: number; max: number }> = {
  state: { base: 9, max: 14 },
  region: { base: 8, max: 12 },
  district: { base: 7.5, max: 11 },
};

type Props = {
  level: AdminLevel;
  data: FeatureCollection & { features: Feature[] };
  /** District names shown before zoom 8 (e.g. the flooded ones). */
  listed?: Set<string>;
};

/**
 * State, region or district outlines with small bold names that grow as the
 * map zooms in. District names appear for every district from zoom 8;
 * further out only for `listed` districts, so the map stays readable.
 */
export function AdminBoundaries({ level, data, listed }: Props) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });
  const all = level !== 'district' || zoom >= 8;
  const size = Math.min(LABEL_SIZE[level].max, LABEL_SIZE[level].base + Math.max(0, zoom - 5) * 1.5);

  return (
    <>
      <GeoJSON
        key={level}
        data={data}
        style={ADMIN_STYLE[level]}
        onEachFeature={(feature, layer) => layer.bindTooltip(String(feature.properties?.name ?? ''), { sticky: true })}
      />
      {data.features.map((feature) => {
        const { id, name, lx, ly } = (feature.properties ?? {}) as { id: string; name: string; lx?: number; ly?: number };
        if (lx === undefined || ly === undefined || (!all && !listed?.has(id))) return null;
        const icon = L.divIcon({
          className: `admin-label admin-label-${level}`,
          html: `<span style="font-size:${size}px">${name.replace(/[&<>"]/g, '')}</span>`,
          iconSize: [0, 0],
        });
        return <Marker key={`${level}-${id}-${size}`} position={[ly, lx]} icon={icon} interactive={false} keyboard={false} />;
      })}
    </>
  );
}
