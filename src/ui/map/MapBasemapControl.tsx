import { MAP_LAYERS, type MapLayerId } from '../../application/map-layers';
import { mapLayerLabel } from '../../application/locale';
import { useLocale } from '../chrome/LocaleContext';

type Props = {
  value: MapLayerId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (id: MapLayerId) => void;
  className?: string;
};

const LayersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M12 4l8 4-8 4-8-4 8-4zm-8 8l8 4 8-4M4 16l8 4 8-4" />
  </svg>
);

/** Layers icon control: Streets (default), Satellite, Terrain. */
export function MapBasemapControl({
  value,
  open,
  onOpenChange,
  onChange,
  className = '',
}: Props) {
  const { copy, locale } = useLocale();
  return (
    <div className={`map-basemap-control tour-layer-wrap ${className}`.trim()}>
      <button
        type="button"
        aria-label={copy.mapLayers}
        aria-expanded={open}
        aria-pressed={open}
        onClick={() => onOpenChange(!open)}
      >
        <LayersIcon />
      </button>
      {open ? (
        <div className="tour-layer-menu" role="menu">
          {MAP_LAYERS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitemradio"
              aria-checked={item.id === value}
              className={item.id === value ? 'active' : undefined}
              onClick={() => {
                onChange(item.id);
                onOpenChange(false);
              }}
            >
              {mapLayerLabel(item.id, locale)}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
