import { useEffect, useRef } from 'react';
import {
  AUTOPLAY_SPEEDS,
  isScrollComplete,
  resolvePageScroll,
  scrollPixelsForFrame,
} from '../../application/autoplay-scroll';
import { shouldKeepAutoplayAlive } from '../../application/autoplay-map-sync';
import { scrollPageToTop } from '../../application/scroll-page-top';
import { useAutoplay } from './AutoplayContext';
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
  const {
    playing,
    speed,
    reducedMotion,
    holdScroll,
    mapDriving,
    setPlaying,
    setSpeed,
    pause,
    beginProgrammaticScroll,
    endProgrammaticScroll,
    isProgrammaticScroll,
  } = useAutoplay();

  const playingRef = useRef(playing);
  const speedRef = useRef(speed);
  const holdRef = useRef(holdScroll);
  const mapDrivingRef = useRef(mapDriving);
  const frameRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const playStartedAtRef = useRef<number | null>(null);

  playingRef.current = playing;
  speedRef.current = speed;
  holdRef.current = holdScroll;
  mapDrivingRef.current = mapDriving;

  useEffect(() => {
    if (!playing || reducedMotion) {
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      lastTsRef.current = null;
      playStartedAtRef.current = null;
      return;
    }

    playStartedAtRef.current = performance.now();

    const tick = (ts: number) => {
      if (!playingRef.current) return;
      const last = lastTsRef.current;
      lastTsRef.current = ts;
      const deltaMs = last == null ? 16 : Math.min(64, ts - last);
      const scroll = resolvePageScroll();
      const keepAlive = shouldKeepAutoplayAlive(scroll.max, mapDrivingRef.current, holdRef.current);

      if (holdRef.current) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }

      if (isScrollComplete(scroll.top, scroll.max)) {
        if (keepAlive) {
          frameRef.current = requestAnimationFrame(tick);
          return;
        }
        const started = playStartedAtRef.current;
        // Allow map tours one short window to claim driving on non-scrolling pages.
        if (scroll.max <= 0 && started != null && ts - started < 280) {
          frameRef.current = requestAnimationFrame(tick);
          return;
        }
        setPlaying(false);
        return;
      }

      const next = Math.min(scroll.max, scroll.top + scrollPixelsForFrame(speedRef.current, deltaMs));
      beginProgrammaticScroll();
      scroll.apply(next);
      endProgrammaticScroll();
      if (isScrollComplete(next, scroll.max) && !mapDrivingRef.current) {
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
  }, [playing, reducedMotion, setPlaying, beginProgrammaticScroll, endProgrammaticScroll]);

  useEffect(() => {
    if (!playing) return;

    const pauseFromUser = () => {
      if (isProgrammaticScroll()) return;
      pause();
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
  }, [playing, pause, isProgrammaticScroll]);

  const togglePlay = () => {
    if (reducedMotion) return;
    if (playing) {
      pause();
      return;
    }
    const scroll = resolvePageScroll();
    if (isScrollComplete(scroll.top, scroll.max) && !mapDriving) {
      scrollPageToTop();
    }
    setPlaying(true);
  };

  const resetToTop = () => {
    pause();
    scrollPageToTop();
  };

  return (
    <div className="autoplay-scroll" role="region" aria-label={copy.autoplayLabel}>
      <div className="autoplay-scroll-inner">
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
            onChange={(event) => setSpeed(Number(event.target.value))}
          >
            {AUTOPLAY_SPEEDS.map((value) => (
              <option key={value} value={String(value)}>
                {value}x
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
