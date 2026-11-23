import { GeoJSON } from 'react-leaflet';
import type { Feature, FeatureCollection } from 'geojson';
import { formatKm2 } from '../../application/area';
import { CHARCOAL_COLORS, type CharcoalKind } from '../../application/charcoal';
import { useLocale } from '../chrome/LocaleContext';
import { useWatchFile } from '../useWatchData';

type AreaProps = { kind: CharcoalKind; ha: number; districts: string[]; region: string };

const escape = (text: string) => text.replace(/[&<>"]/g, '');

/**
 * Charcoal production areas on the map: red areas (export darker, local
 * lighter) and the study area dashed. Tapping an area opens a popup with its
 * kind, location (districts, region) and size. Only the kinds in `kinds` show.
 */
export function CharcoalLayer({ kinds }: { kinds: Record<CharcoalKind, boolean> }) {
  const { copy } = useLocale();
  const { data: areas } = useWatchFile<FeatureCollection & { features: Feature[] }>('charcoal-areas.geojson');
  if (!areas) return null;
  const name: Record<CharcoalKind, string> = {
    export: copy.charcoalExport,
    local: copy.charcoalLocal,
    studied: copy.charcoalStudied,
  };
  const shown = { ...areas, features: areas.features.filter((f) => kinds[(f.properties as AreaProps).kind]) };

  return (
    <GeoJSON
      key={`charcoal-${Object.values(kinds).join('')}-${copy.km2}`}
      data={shown}
      style={(feature) => {
        const kind = (feature?.properties as AreaProps).kind;
        return kind === 'studied'
          ? { color: CHARCOAL_COLORS.studied, weight: 1.5, dashArray: '5 4', fill: false }
          : { color: CHARCOAL_COLORS[kind], weight: 1.2, fillColor: CHARCOAL_COLORS[kind], fillOpacity: 0.55 };
      }}
      onEachFeature={(feature, layer) => {
        const { kind, ha, districts, region } = feature.properties as AreaProps;
        layer.bindPopup(
          `<div class="charcoal-popup"><strong>${escape(name[kind])}</strong>` +
            `<span>${escape(districts.join(', '))}</span>` +
            `<span>${escape(region)} · ${formatKm2(ha)} ${escape(copy.km2)}</span></div>`,
        );
      }}
    />
  );
}
