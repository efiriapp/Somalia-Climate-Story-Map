import { GeoJSON, Marker, Tooltip } from 'react-leaflet';
import type { Feature, FeatureCollection } from 'geojson';
import { CHARCOAL_COLORS, type CharcoalKind } from '../../application/charcoal';
import { useLocale } from '../chrome/LocaleContext';
import { charcoalPinIcon } from '../map/charcoalIcon';
import { useWatchFile } from '../useWatchData';

type Collection = FeatureCollection & { features: Feature[] };

const PINS: Record<'export' | 'local', ReturnType<typeof charcoalPinIcon>> = {
  export: charcoalPinIcon(CHARCOAL_COLORS.export),
  local: charcoalPinIcon(CHARCOAL_COLORS.local),
};

/**
 * Charcoal production areas on the map: shaded areas (export darker, local
 * lighter, study area dashed) and a charcoal pin in each area, so they show
 * even when the map is zoomed out.
 */
export function CharcoalLayer() {
  const { copy } = useLocale();
  const { data: areas } = useWatchFile<Collection>('charcoal-areas.geojson');
  const { data: sites } = useWatchFile<Collection>('charcoal-sites.geojson');
  const name: Record<CharcoalKind, string> = {
    export: copy.charcoalExport,
    local: copy.charcoalLocal,
    studied: copy.charcoalStudied,
  };

  return (
    <>
      {areas ? (
        <GeoJSON
          key="charcoal-areas"
          data={areas}
          style={(feature) => {
            const kind = feature?.properties?.kind as CharcoalKind;
            return kind === 'studied'
              ? { color: CHARCOAL_COLORS.studied, weight: 1.5, dashArray: '5 4', fill: false }
              : { color: CHARCOAL_COLORS[kind], weight: 1, fillColor: CHARCOAL_COLORS[kind], fillOpacity: 0.45 };
          }}
          onEachFeature={(feature, layer) =>
            layer.bindTooltip(name[feature.properties?.kind as CharcoalKind] ?? '', { sticky: true })
          }
        />
      ) : null}
      {sites?.features.map((site, i) => {
        const kind = site.properties?.kind as 'export' | 'local';
        const [lng, lat] = (site.geometry as unknown as { coordinates: [number, number] }).coordinates;
        return (
          <Marker key={`charcoal-${i}`} position={[lat, lng]} icon={PINS[kind]} keyboard={false}>
            <Tooltip direction="top">
              <strong>{name[kind]}</strong>
              <br />
              {Number(site.properties?.ha).toLocaleString('en')} {copy.hectares}
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
}
