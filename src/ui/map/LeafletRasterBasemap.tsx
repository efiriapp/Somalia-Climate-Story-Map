import { TileLayer } from 'react-leaflet';
import { leafletBasemaps } from '../../application/leaflet-basemaps';
import { DEFAULT_MAP_LAYER, type MapLayerId } from '../../application/map-layers';

type Props = {
  basemap?: MapLayerId;
};

/** Free open-source Mercator basemap (OSM / Sentinel-2 / OpenTopoMap). */
export function LeafletRasterBasemap({ basemap = DEFAULT_MAP_LAYER }: Props) {
  const layer = leafletBasemaps.find((item) => item.id === basemap) ?? leafletBasemaps[0];
  return <TileLayer key={layer.id} url={layer.url} attribution={layer.attribution} />;
}
