import { useState, type KeyboardEvent, type PointerEvent } from 'react';
import type { FlowPoint } from '../../application/flood-watch';
import { STATUS_COLOR } from './StatusBadge';
import { formatNumber, niceStep, useChartWidth } from './chart-scale';

type Props = {
  points: FlowPoint[];
  p90: number;
  p98: number;
  labels: { p90: string; p98: string; past: string; forecast: string; unit: string };
  formatDate: (iso: string) => string;
  /** Short description for screen readers. */
  summary: string;
};

const SERIES = '#2a78d6';
const GRID = '#e4e4e0';
const TEXT_SECONDARY = '#52514e';
const HEIGHT = 190;
const PAD = { top: 22, right: 14, bottom: 26, left: 46 };

/**
 * One-series line chart of river flow: past 30 days and the 16-day forecast,
 * with the station's 90th/98th percentile flow marked as reference lines.
 */
export function FlowChart({ points, p90, p98, labels, formatDate, summary }: Props) {
  const { ref: wrap, width } = useChartWidth();
  const [active, setActive] = useState<number | null>(null);

  if (points.length < 2) return null;

  const plotW = width - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const maxValue = Math.max(p98, ...points.map((point) => point.value)) * 1.08;
  const step = niceStep(maxValue);
  const yMax = Math.ceil(maxValue / step) * step;
  const ticks = Array.from({ length: Math.round(yMax / step) + 1 }, (_, i) => i * step);
  const x = (index: number) => PAD.left + (index / (points.length - 1)) * plotW;
  const y = (value: number) => PAD.top + plotH - (value / yMax) * plotH;

  const todayIndex = Math.max(0, points.findIndex((point) => point.forecast) - 1);
  const path = (from: number, to: number) =>
    points
      .slice(from, to + 1)
      .map((point, i) => `${i === 0 ? 'M' : 'L'}${x(from + i).toFixed(1)},${y(point.value).toFixed(1)}`)
      .join(' ');
  const area = `${path(0, points.length - 1)} L${x(points.length - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z`;
  const today = points[todayIndex]!;
  const shown = active === null ? null : points[active];

  const pick = (event: PointerEvent<SVGRectElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - box.left) / box.width;
    setActive(Math.min(points.length - 1, Math.max(0, Math.round(ratio * (points.length - 1)))));
  };
  const onKey = (event: KeyboardEvent<SVGSVGElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const start = active ?? todayIndex;
    setActive(Math.min(points.length - 1, Math.max(0, start + (event.key === 'ArrowRight' ? 1 : -1))));
  };

  const thresholdLabel = (value: number, text: string, color: string) => (
    <g>
      <line x1={PAD.left} x2={width - PAD.right} y1={y(value)} y2={y(value)} stroke={color} strokeWidth={1} />
      <text x={width - PAD.right} y={y(value) - 4} textAnchor="end" className="chart-label">
        {text} · {formatNumber(value)}
      </text>
    </g>
  );

  return (
    <div className="flow-chart" ref={wrap}>
      <svg
        width={width}
        height={HEIGHT}
        role="img"
        aria-label={summary}
        tabIndex={0}
        onKeyDown={onKey}
        onBlur={() => setActive(null)}
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={PAD.left} x2={width - PAD.right} y1={y(tick)} y2={y(tick)} stroke={GRID} strokeWidth={1} />
            <text x={PAD.left - 6} y={y(tick) + 4} textAnchor="end" className="chart-axis">
              {formatNumber(tick)}
            </text>
          </g>
        ))}
        {thresholdLabel(p90, labels.p90, STATUS_COLOR.warning)}
        {thresholdLabel(p98, labels.p98, STATUS_COLOR.critical)}

        <line x1={x(todayIndex)} x2={x(todayIndex)} y1={PAD.top - 12} y2={PAD.top + plotH} stroke={TEXT_SECONDARY} strokeWidth={1} />
        <text x={x(todayIndex) - 6} y={PAD.top - 4} textAnchor="end" className="chart-label">
          {labels.past}
        </text>
        <text x={x(todayIndex) + 6} y={PAD.top - 4} textAnchor="start" className="chart-label">
          {labels.forecast} →
        </text>

        <path d={area} fill={SERIES} fillOpacity={0.1} stroke="none" />
        <path d={path(0, todayIndex)} fill="none" stroke={SERIES} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        <path
          d={path(todayIndex, points.length - 1)}
          fill="none"
          stroke={SERIES}
          strokeOpacity={0.55}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle cx={x(todayIndex)} cy={y(today.value)} r={4} fill={SERIES} stroke="#fff" strokeWidth={2} />

        <text x={PAD.left} y={HEIGHT - 8} textAnchor="start" className="chart-axis">
          {formatDate(points[0]!.date)}
        </text>
        <text x={width - PAD.right} y={HEIGHT - 8} textAnchor="end" className="chart-axis">
          {formatDate(points.at(-1)!.date)}
        </text>

        {shown ? (
          <line x1={x(active!)} x2={x(active!)} y1={PAD.top} y2={PAD.top + plotH} stroke="#0b0b0b" strokeOpacity={0.35} strokeWidth={1} />
        ) : null}
        <rect
          x={PAD.left}
          y={PAD.top}
          width={plotW}
          height={plotH}
          fill="transparent"
          onPointerMove={pick}
          onPointerDown={pick}
          onPointerLeave={() => setActive(null)}
        />
      </svg>
      {shown ? (
        <div
          className="chart-tooltip"
          style={{ left: Math.min(Math.max(x(active!), 70), width - 70), top: 0 }}
          role="status"
        >
          <strong>
            {formatNumber(shown.value)} {labels.unit}
          </strong>
          <span>
            {formatDate(shown.date)}
            {shown.forecast ? ` · ${labels.forecast}` : ''}
          </span>
        </div>
      ) : null}
    </div>
  );
}
