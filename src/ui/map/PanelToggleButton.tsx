/**
 * Map button with a bar-chart icon that shows or hides a map's side panel
 * (flooded areas, forest loss). Tap to open, tap again to close.
 */
export function PanelToggleButton({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
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
        <path d="M4 20V10M10 20V4M16 20v-7M21 20H3" />
      </svg>
    </button>
  );
}
