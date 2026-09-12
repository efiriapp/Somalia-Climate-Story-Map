import { useEffect, useRef, useState } from 'react';
import {
  AUTOPLAY_SPEEDS,
  DEFAULT_AUTOPLAY_SPEED,
  clampAutoplaySpeed,
  isScrollComplete,
  prefersReducedMotion,
  resolvePageScroll,
  scrollPixelsForFrame,
  type AutoplaySpeed,
} from '../../application/autoplay-scroll';
import { scrollPageToTop } from '../../application/scroll-page-top';
import { useLocale } from './LocaleContext';

const USER_SCROLL_KEYS = new Set([
  'ArrowDown',
  'ArrowUp',
  'PageDown',
  'PageUp',
  'Home',
  'End',
  ' ',
  'Spacebar',
]);

export function AutoplayScroll() {
  const { copy } = useLocale();
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<AutoplaySpeed>(DEFAULT_AUTOPLAY_SPEED);
  const [reducedMotion, setReducedMotion] = useState(() => prefersReducedMotion());
  const playingRef = useRef(playing);
  const speedRef = useRef(speed);
  const programmaticRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  playingRef.current = playing;
  speedRef.current = speed;

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      const reduced = prefersReducedMotion(media);
      setReducedMotion(reduced);
      if (reduced) setPlaying(false);
    };
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!playing || reducedMotion) {
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      lastTsRef.current = null;
      return;
    }

    const tick = (ts: number) => {
      if (!playingRef.current) return;
      const last = lastTsRef.current;
      lastTsRef.current = ts;
      const deltaMs = last == null ? 16 : Math.min(64, ts - last);
      const scroll = resolvePageScroll();
      if (isScrollComplete(scroll.top, scroll.max)) {
        setPlaying(false);
        return;
      }
      const next = Math.min(scroll.max, scroll.top + scrollPixelsForFrame(speedRef.current, deltaMs));
      programmaticRef.current = true;
      scroll.apply(next);
      requestAnimationFrame(() => {
        programmaticRef.current = false;
      });
      if (isScrollComplete(next, scroll.max)) {
        setPlaying(false);
        return;
      }
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      lastTsRef.current = null;
    };
  }, [playing, reducedMotion]);

  useEffect(() => {
    if (!playing) return;

    const pauseFromUser = () => {
      if (programmaticRef.current) return;
      setPlaying(false);
    };

    const onWheel = () => pauseFromUser();
    const onTouch = () => pauseFromUser();
    const onKey = (event: KeyboardEvent) => {
      if (USER_SCROLL_KEYS.has(event.key)) pauseFromUser();
    };
    const onScroll = () => pauseFromUser();

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.getElementById('root')?.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
      document.getElementById('root')?.removeEventListener('scroll', onScroll);
    };
  }, [playing]);

  const togglePlay = () => {
    if (reducedMotion) return;
    if (playing) {
      setPlaying(false);
      return;
    }
    const scroll = resolvePageScroll();
    if (isScrollComplete(scroll.top, scroll.max)) {
      scrollPageToTop();
    }
    setPlaying(true);
  };

  const resetToTop = () => {
    setPlaying(false);
    scrollPageToTop();
  };

  return (
    <div className="autoplay-scroll" role="region" aria-label={copy.autoplayLabel}>
      <button
        type="button"
        className="autoplay-scroll-play"
        aria-pressed={playing}
        aria-label={playing ? copy.autoplayPause : copy.autoplayPlay}
        disabled={reducedMotion}
        onClick={togglePlay}
      >
        {playing ? copy.autoplayPause : copy.autoplayPlay}
      </button>
      <button
        type="button"
        className="autoplay-scroll-reset"
        aria-label={copy.autoplayReset}
        onClick={resetToTop}
      >
        {copy.autoplayReset}
      </button>
      <label className="autoplay-scroll-speed">
        <span className="visually-hidden">{copy.autoplaySpeed}</span>
        <select
          value={String(speed)}
          aria-label={copy.autoplaySpeed}
          disabled={reducedMotion}
          onChange={(event) => setSpeed(clampAutoplaySpeed(Number(event.target.value)))}
        >
          {AUTOPLAY_SPEEDS.map((value) => (
            <option key={value} value={String(value)}>
              {value}x
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
