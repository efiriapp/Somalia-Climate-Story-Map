import { useState, type KeyboardEvent } from 'react';
import { formatNumber, niceStep, useChartWidth } from './chart-scale';

type Props = {
  /** One value per year, already in `unit`. */
  points: { year: number; value: number }[];
  color: string;
  unit: string;
  /** Short description for screen readers. */
  summary: string;
};

const GRID = '#e4e4e0';
const HEIGHT = 220;
const PAD = { top: 26, right: 10, bottom: 24, left: 44 };

/** Bar chart of area lost per year, with a hover/keyboard readout. */
export function LossChart({ points, color, unit, summary }: Props) {
  const { ref, width } = useChartWidth();
  const [active, setActive] = useState<number | null>(null);
  if (!points.length) return null;

  const plotW = width - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  // Small areas (a district's yearly loss can be under 1 km²) still fill the chart.
  const max = (Math.max(0, ...points.map((p) => p.value)) || 1) * 1.05;
  const step = niceStep(max);
  const yMax = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: Math.round(yMax / step) + 1 }, (_, i) => i * step);
  const slot = plotW / points.length;
  const barW = Math.max(3, Math.min(22, slot - 2)); // 2px gap between bars
  const x = (i: number) => PAD.left + i * slot + (slot - barW) / 2;
  const y = (value: number) => PAD.top + plotH - (value / yMax) * plotH;
  const shown = active === null ? null : points[active];

  const onKey = (event: KeyboardEvent<SVGSVGElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const start = active ?? points.length - 1;
    setActive(Math.min(points.length - 1, Math.max(0, start + (event.key === 'ArrowRight' ? 1 : -1))));
  };

  // Bars: square at the baseline, 4px rounded at the top.
  const bar = (i: number, value: number) => {
    const top = y(value);
    const h = PAD.top + plotH - top;
    if (h <= 0) return '';
    const r = Math.min(4, barW / 2, h);
    const left = x(i);
    const right = left + barW;
    const base = PAD.top + plotH;
    return `M${left},${base}V${top + r}Q${left},${top} ${left + r},${top}H${right - r}Q${right},${top} ${right},${top + r}V${base}Z`;
  };

  return (
    <div className="flow-chart" ref={ref}>
      <svg
        width={width}
        height={HEIGHT}
        role="img"
        aria-label={summary}
        tabIndex={0}
        onKeyDown={onKey}
        onBlur={() => setActive(null)}
        onPointerLeave={() => setActive(null)}
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={PAD.left} x2={width - PAD.right} y1={y(tick)} y2={y(tick)} stroke={GRID} strokeWidth={1} />
            <text x={PAD.left - 6} y={y(tick) + 4} textAnchor="end" className="chart-axis">
              {formatNumber(tick)}
            </text>
          </g>
        ))}
        {points.map((point, i) => (
          <g key={point.year}>
            <path d={bar(i, point.value)} fill={color} fillOpacity={active === null || active === i ? 1 : 0.45} />
            {/* Hit area: the whole column, wider than the bar. */}
            <rect
              x={PAD.left + i * slot}
              y={PAD.top}
              width={slot}
              height={plotH}
              fill="transparent"
              onPointerEnter={() => setActive(i)}
              onPointerDown={() => setActive(i)}
            />
            {i % 5 === 0 || i === points.length - 1 ? (
              <text x={x(i) + barW / 2} y={HEIGHT - 6} textAnchor="middle" className="chart-axis">
                {point.year}
              </text>
            ) : null}
          </g>
        ))}
      </svg>
      {shown ? (
        <div
          className="chart-tooltip"
          style={{ left: Math.min(Math.max(x(active!) + barW / 2, 70), width - 70), top: y(shown.value) - 6 }}
          role="status"
        >
          <strong>
            {formatNumber(shown.value)} {unit}
          </strong>
          <span>{shown.year}</span>
        </div>
      ) : null}
    </div>
  );
}
