import { useEffect, useRef, useState } from 'react';
import {
  AUTOPLAY_SPEEDS,
  clampAutoplaySpeed,
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

function PlayGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M8 5.5v13l11-6.5z" />
    </svg>
  );
}

function PauseGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M7 5h3.5v14H7zm6.5 0H17v14h-3.5z" />
    </svg>
  );
}

function ChevronGlyph({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d={open ? 'M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z' : 'M8.6 7.4 10 6l6 6-6 6-1.4-1.4L13.2 12z'}
      />
    </svg>
  );
}

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

  const [expanded, setExpanded] = useState(false);
  const [hidden, setHidden] = useState(false);

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

  if (hidden) {
    return (
      <div className="autoplay-scroll is-hidden" role="region" aria-label={copy.autoplayLabel}>
        <button
          type="button"
          className="autoplay-scroll-show"
          aria-label={copy.autoplayShow}
          onClick={() => {
            setHidden(false);
            setExpanded(false);
          }}
        >
          <ChevronGlyph open={false} />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`autoplay-scroll${expanded ? ' is-expanded' : ''}`}
      role="region"
      aria-label={copy.autoplayLabel}
    >
      {!expanded ? (
        <button
          type="button"
          className="autoplay-scroll-fab"
          aria-expanded={false}
          aria-label={copy.autoplayExpand}
          aria-pressed={playing}
          onClick={() => setExpanded(true)}
        >
          {playing ? <PauseGlyph /> : <PlayGlyph />}
        </button>
      ) : (
        <div className="autoplay-scroll-inner">
          <button
            type="button"
            className="autoplay-scroll-play"
            aria-pressed={playing}
            aria-label={playing ? copy.autoplayPause : copy.autoplayPlay}
            disabled={reducedMotion}
            onClick={togglePlay}
          >
            {playing ? <PauseGlyph /> : <PlayGlyph />}
            <span>{playing ? copy.autoplayPause : copy.autoplayPlay}</span>
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
          <button
            type="button"
            className="autoplay-scroll-collapse"
            aria-expanded={true}
            aria-label={copy.autoplayCollapse}
            onClick={() => setExpanded(false)}
          >
            <ChevronGlyph open />
          </button>
          <button
            type="button"
            className="autoplay-scroll-hide"
            aria-label={copy.autoplayHide}
            onClick={() => {
              setHidden(true);
              setExpanded(false);
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
