import { GeoJSON } from 'react-leaflet';
import type { Feature, FeatureCollection } from 'geojson';
import { CHARCOAL_COLORS, type CharcoalKind } from '../../application/charcoal';
import { useLocale } from '../chrome/LocaleContext';
import { useWatchFile } from '../useWatchData';

/** Charcoal production areas on the map: red areas (export darker, local lighter), study area dashed. */
export function CharcoalLayer() {
  const { copy } = useLocale();
  const { data: areas } = useWatchFile<FeatureCollection & { features: Feature[] }>('charcoal-areas.geojson');
  const name: Record<CharcoalKind, string> = {
    export: copy.charcoalExport,
    local: copy.charcoalLocal,
    studied: copy.charcoalStudied,
  };
  if (!areas) return null;
  return (
    <GeoJSON
      key="charcoal-areas"
      data={areas}
      style={(feature) => {
        const kind = feature?.properties?.kind as CharcoalKind;
        return kind === 'studied'
          ? { color: CHARCOAL_COLORS.studied, weight: 1.5, dashArray: '5 4', fill: false }
          : { color: CHARCOAL_COLORS[kind], weight: 1.2, fillColor: CHARCOAL_COLORS[kind], fillOpacity: 0.55 };
      }}
      onEachFeature={(feature, layer) => layer.bindTooltip(name[feature.properties?.kind as CharcoalKind] ?? '', { sticky: true })}
    />
  );
}
