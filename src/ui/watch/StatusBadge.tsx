/**
 * Status colours are reserved for state (the dataviz status palette) and
 * always come with a distinct icon shape and a text label, so status is never
 * read from colour alone. Text stays in the normal ink colour.
 */
export type StatusTone = 'good' | 'warning' | 'critical' | 'wet' | 'neutral';

export const STATUS_COLOR: Record<StatusTone, string> = {
  good: '#0ca30c',
  warning: '#fab219',
  critical: '#d03b3b',
  wet: '#2a78d6',
  neutral: '#8a8a85',
};

export function StatusIcon({ tone, size = 16 }: { tone: StatusTone; size?: number }) {
  const color = STATUS_COLOR[tone];
  return (
    <svg className="status-icon" width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      {tone === 'good' ? (
        <>
          <circle cx="8" cy="8" r="7" fill={color} />
          <path d="M4.6 8.3 7 10.6l4.4-4.7" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : tone === 'warning' ? (
        <>
          <path d="M8 1.2 15.2 14H.8Z" fill={color} />
          <path d="M8 5.6v4.2" stroke="#1a1a19" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="8" cy="12" r="1" fill="#1a1a19" />
        </>
      ) : tone === 'critical' ? (
        <>
          <path d="M5.1 1h5.8L15 5.1v5.8L10.9 15H5.1L1 10.9V5.1Z" fill={color} />
          <path d="M8 4.4v4.6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="8" cy="11.4" r="1" fill="#fff" />
        </>
      ) : tone === 'wet' ? (
        <path d="M8 1.2C8 1.2 3 7.2 3 10.2a5 5 0 0 0 10 0C13 7.2 8 1.2 8 1.2Z" fill={color} />
      ) : (
        <>
          <circle cx="8" cy="8" r="6.2" fill="none" stroke={color} strokeWidth="1.8" />
          <path d="M5 8h6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export function StatusBadge({ tone, label, hint }: { tone: StatusTone; label: string; hint?: string }) {
  return (
    <span className={`status-badge status-${tone}`} title={hint}>
      <StatusIcon tone={tone} />
      <span>{label}</span>
    </span>
  );
}

export function StatusLegend({ items }: { items: { tone: StatusTone; label: string; hint: string }[] }) {
  return (
    <ul className="status-legend">
      {items.map((item) => (
        <li key={item.label}>
          <StatusIcon tone={item.tone} />
          <span>
            <strong>{item.label}</strong> {item.hint}
          </span>
        </li>
      ))}
    </ul>
  );
}
