import type { ReactNode } from 'react';

const ICONS: Record<'chart' | 'layers', ReactNode> = {
  chart: <path d="M4 20V10M10 20V4M16 20v-7M21 20H3" />,
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </>
  ),
};

/**
 * Round map button that opens or closes something: the side panel (chart
 * icon) or the layer list (layers icon). Tap to open, tap again to close.
 */
export function MapToggleButton({
  on,
  onToggle,
  label,
  icon,
}: {
  on: boolean;
  onToggle: () => void;
  label: string;
  icon: keyof typeof ICONS;
}) {
  return (
    <button
      type="button"
      className={on ? 'map-panel-toggle active' : 'map-panel-toggle'}
      aria-pressed={on}
      aria-label={label}
      title={label}
      onClick={onToggle}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {ICONS[icon]}
      </svg>
    </button>
  );
}

/** Box over the map (layers, compare...) with a title and a close button. */
export function MapDialog({
  title,
  closeLabel,
  onClose,
  children,
}: {
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flood-map-panel" role="dialog" aria-label={title}>
      <div className="flood-map-panel-head">
        <strong>{title}</strong>
        <button type="button" onClick={onClose} aria-label={closeLabel}>
          ×
        </button>
      </div>
      {children}
    </div>
  );
}
