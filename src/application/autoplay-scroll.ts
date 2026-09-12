/** Stepped reading speeds for narrative auto-scroll (0.5x–2x). */
export const AUTOPLAY_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

export type AutoplaySpeed = (typeof AUTOPLAY_SPEEDS)[number];

/** Sensible 1x baseline: comfortable reading scroll in px/second. */
export const AUTOPLAY_BASE_PX_PER_SEC = 42;

export const DEFAULT_AUTOPLAY_SPEED: AutoplaySpeed = 1;

export function clampAutoplaySpeed(speed: number): AutoplaySpeed {
  let best: AutoplaySpeed = DEFAULT_AUTOPLAY_SPEED;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const candidate of AUTOPLAY_SPEEDS) {
    const dist = Math.abs(candidate - speed);
    if (dist < bestDist) {
      best = candidate;
      bestDist = dist;
    }
  }
  return best;
}

/** Pixels to advance for one animation frame at the given speed multiplier. */
export function scrollPixelsForFrame(speed: number, deltaMs: number): number {
  if (!(deltaMs > 0) || !Number.isFinite(deltaMs)) return 0;
  const rate = clampAutoplaySpeed(speed);
  return (AUTOPLAY_BASE_PX_PER_SEC * rate * deltaMs) / 1000;
}

export function maxScrollOffset(scrollHeight: number, clientHeight: number): number {
  return Math.max(0, scrollHeight - clientHeight);
}

export function isScrollComplete(scrollTop: number, maxScroll: number, epsilon = 2): boolean {
  return maxScroll <= 0 || scrollTop >= maxScroll - epsilon;
}

export function prefersReducedMotion(
  media: Pick<MediaQueryList, 'matches'> | null | undefined = typeof window !== 'undefined'
    ? window.matchMedia?.('(prefers-reduced-motion: reduce)')
    : null,
): boolean {
  return Boolean(media?.matches);
}

type ScrollMetrics = {
  top: number;
  max: number;
  apply: (top: number) => void;
};

/** Prefer #root when it scrolls; otherwise documentElement / body / window. */
export function resolvePageScroll(): ScrollMetrics {
  const root = typeof document !== 'undefined' ? document.getElementById('root') : null;
  if (root && root.scrollHeight > root.clientHeight + 1) {
    return {
      top: root.scrollTop,
      max: maxScrollOffset(root.scrollHeight, root.clientHeight),
      apply: (top) => {
        root.scrollTop = top;
      },
    };
  }

  const doc = typeof document !== 'undefined' ? document.documentElement : null;
  const body = typeof document !== 'undefined' ? document.body : null;
  const top = typeof window !== 'undefined' ? window.scrollY || doc?.scrollTop || body?.scrollTop || 0 : 0;
  const scrollHeight = Math.max(doc?.scrollHeight ?? 0, body?.scrollHeight ?? 0);
  const clientHeight =
    typeof window !== 'undefined' ? window.innerHeight : (doc?.clientHeight ?? 0);

  return {
    top,
    max: maxScrollOffset(scrollHeight, clientHeight),
    apply: (next) => {
      if (typeof window !== 'undefined') {
        window.scrollTo(0, next);
      }
      if (doc) doc.scrollTop = next;
      if (body) body.scrollTop = next;
      if (root) root.scrollTop = next;
    },
  };
}
