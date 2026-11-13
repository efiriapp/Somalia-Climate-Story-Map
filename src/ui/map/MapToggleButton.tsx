import type { ReactNode } from 'react';

const ICONS: Record<'chart' | 'layers' | 'forest' | 'charcoal', ReactNode> = {
  chart: <path d="M4 20V10M10 20V4M16 20v-7M21 20H3" />,
  forest: (
    <>
      <path d="M12 3 6.5 10.5H9L5 16h14l-4-5.5h2.5L12 3Z" />
      <path d="M12 16v5" />
    </>
  ),
  charcoal: (
    <>
      <path d="M3.5 20c0-3.9 3.8-6.6 8.5-6.6s8.5 2.7 8.5 6.6Z" />
      <path d="M12 2.8c1.5 2.3 3.4 3.7 3.4 6.3a3.4 3.4 0 0 1-6.8 0c0-1.6.9-2.8 1.8-3.7.2 1.2.8 1.9 1.7 2.3.3-1.6.2-3.1-.1-4.9Z" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </>
  ),
};

/**
 * Round map button that opens or closes something: a side panel (chart,
 * forest or charcoal icon) or the layer list (layers icon). Tap to open, tap
 * again to close.
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
