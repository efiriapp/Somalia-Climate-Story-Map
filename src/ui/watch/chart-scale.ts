import { useEffect, useRef, useState } from 'react';

/** A round axis step (1, 2 or 5 × a power of ten) giving about three gridlines. */
export const niceStep = (max: number): number => {
  const raw = max / 3;
  const power = 10 ** Math.floor(Math.log10(raw));
  const unit = raw / power;
  return (unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 5 ? 5 : 10) * power;
};

/** Axis and tooltip numbers: 1,234 or 25K. */
export const formatNumber = (value: number): string =>
  value >= 10_000 ? `${Math.round(value / 1000)}K` : Math.round(value).toLocaleString('en');

/** Width of the chart's box, kept up to date as the page resizes. */
export function useChartWidth(initial = 560) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(initial);
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.max(260, Math.round(entry.contentRect.width)));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
}
