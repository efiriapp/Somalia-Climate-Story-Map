import { GeoJSON, Marker, Tooltip } from 'react-leaflet';
import type { Feature, FeatureCollection } from 'geojson';
import L from 'leaflet';
import { CHARCOAL_COLORS, type CharcoalKind } from '../../application/charcoal';
import { useLocale } from '../chrome/LocaleContext';
import { formatKm2 } from '../../application/area';
import { useWatchFile } from '../useWatchData';

type Collection = FeatureCollection & { features: Feature[] };

const escape = (text: string) => text.replace(/[&<>"]/g, '');

/**
 * Charcoal production areas on the map: red areas (export darker, local
 * lighter), the study area dashed, and the location of each potential export
 * area written beside it. Only the kinds in `kinds` are drawn.
 */
export function CharcoalLayer({ kinds }: { kinds: Record<CharcoalKind, boolean> }) {
  const { copy } = useLocale();
  const { data: areas } = useWatchFile<Collection>('charcoal-areas.geojson');
  const { data: places } = useWatchFile<Collection>(kinds.export ? 'charcoal-export-places.geojson' : null);
  const name: Record<CharcoalKind, string> = {
    export: copy.charcoalExport,
    local: copy.charcoalLocal,
    studied: copy.charcoalStudied,
  };
  const shown = areas
    ? { ...areas, features: areas.features.filter((f) => kinds[f.properties?.kind as CharcoalKind]) }
    : null;

  return (
    <>
      {shown ? (
        <GeoJSON
          key={`charcoal-${Object.values(kinds).join('')}`}
          data={shown}
          style={(feature) => {
            const kind = feature?.properties?.kind as CharcoalKind;
            return kind === 'studied'
              ? { color: CHARCOAL_COLORS.studied, weight: 1.5, dashArray: '5 4', fill: false }
              : { color: CHARCOAL_COLORS[kind], weight: 1.2, fillColor: CHARCOAL_COLORS[kind], fillOpacity: 0.55 };
          }}
          onEachFeature={(feature, layer) =>
            layer.bindTooltip(name[feature.properties?.kind as CharcoalKind] ?? '', { sticky: true })
          }
        />
      ) : null}
      {kinds.export
        ? places?.features.map((place, i) => {
            const { districts, region, ha } = place.properties as { districts: string[]; region: string; ha: number };
            const [lng, lat] = (place.geometry as unknown as { coordinates: [number, number] }).coordinates;
            const icon = L.divIcon({
              className: 'charcoal-place',
              html: `<span>${escape(districts.join(' · '))}<small>${escape(region)}</small></span>`,
              iconSize: [0, 0],
            });
            return (
              <Marker key={`export-place-${i}`} position={[lat, lng]} icon={icon} keyboard={false}>
                <Tooltip direction="top" offset={[0, -14]}>
                  <strong>{copy.charcoalExport}</strong>
                  <br />
                  {districts.join(', ')} ({region}) · {formatKm2(ha)} {copy.km2}
                </Tooltip>
              </Marker>
            );
          })
        : null}
    </>
  );
}
