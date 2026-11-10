import { useEffect, useState, type RefObject } from 'react';
import { useMap } from 'react-leaflet';

const nativeElement = () => (typeof document === 'undefined' ? null : document.fullscreenElement);

/**
 * Full-screen toggle for a map wrapper. Uses the browser Fullscreen API, and
 * on browsers without it for elements (e.g. iPhone Safari) falls back to a
 * CSS class that fixes the wrapper over the whole window.
 */
export function useFullscreen(target: RefObject<HTMLElement | null>) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const sync = () => setOn(!!target.current && nativeElement() === target.current);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, [target]);

  useEffect(() => {
    const element = target.current;
    if (!element || nativeElement() === element) return;
    element.classList.toggle('is-fullscreen', on);
    document.body.classList.toggle('has-fullscreen-map', on);
    if (!on) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOn(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [on, target]);

  useEffect(
    () => () => {
      document.body.classList.remove('has-fullscreen-map');
    },
    [],
  );

  const toggle = async () => {
    const element = target.current;
    if (!element) return;
    if (nativeElement() === element) {
      await document.exitFullscreen();
      return;
    }
    if (on) {
      setOn(false);
      return;
    }
    if (element.requestFullscreen) {
      try {
        await element.requestFullscreen();
        return;
      } catch {
        // Fall through to the CSS fallback.
      }
    }
    setOn(true);
  };

  return { on, toggle };
}

export function FullscreenButton({
  on,
  onToggle,
  labels,
}: {
  on: boolean;
  onToggle: () => void;
  labels: { enter: string; exit: string };
}) {
  const label = on ? labels.exit : labels.enter;
  return (
    <button type="button" className="map-fullscreen-button" aria-pressed={on} aria-label={label} title={label} onClick={onToggle}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {on ? (
          <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
        ) : (
          <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
        )}
      </svg>
    </button>
  );
}

/** Keeps Leaflet's size in step with its container (full screen, full width, phone rotation). */
export function MapAutoResize() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => map.invalidateSize({ pan: false }));
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);
  return null;
}
