import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_AUTOPLAY_SPEED,
  clampAutoplaySpeed,
  prefersReducedMotion,
  type AutoplaySpeed,
} from '../../application/autoplay-scroll';

type AutoplayContextValue = {
  playing: boolean;
  speed: AutoplaySpeed;
  reducedMotion: boolean;
  holdScroll: boolean;
  mapDriving: boolean;
  setPlaying: (playing: boolean) => void;
  setSpeed: (speed: AutoplaySpeed) => void;
  pause: () => void;
  setHoldScroll: (hold: boolean) => void;
  setMapDriving: (driving: boolean) => void;
  beginProgrammaticScroll: () => void;
  endProgrammaticScroll: () => void;
  isProgrammaticScroll: () => boolean;
};

const AutoplayContext = createContext<AutoplayContextValue | null>(null);

export function AutoplayProvider({ children }: { children: ReactNode }) {
  const [playing, setPlayingState] = useState(false);
  const [speed, setSpeedState] = useState<AutoplaySpeed>(DEFAULT_AUTOPLAY_SPEED);
  const [reducedMotion, setReducedMotion] = useState(() => prefersReducedMotion());
  const [holdScroll, setHoldScrollState] = useState(false);
  const [mapDriving, setMapDrivingState] = useState(false);
  const programmaticRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      const reduced = prefersReducedMotion(media);
      setReducedMotion(reduced);
      if (reduced) {
        setPlayingState(false);
        setHoldScrollState(false);
        setMapDrivingState(false);
      }
    };
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  const setPlaying = useCallback((next: boolean) => {
    if (next && prefersReducedMotion()) return;
    setPlayingState(next);
    if (!next) {
      setHoldScrollState(false);
      setMapDrivingState(false);
    }
  }, []);

  const setSpeed = useCallback((next: number) => {
    setSpeedState(clampAutoplaySpeed(next));
  }, []);

  const pause = useCallback(() => {
    setPlayingState(false);
    setHoldScrollState(false);
    setMapDrivingState(false);
  }, []);

  const setHoldScroll = useCallback((hold: boolean) => {
    setHoldScrollState(hold);
  }, []);

  const setMapDriving = useCallback((driving: boolean) => {
    setMapDrivingState(driving);
  }, []);

  const beginProgrammaticScroll = useCallback(() => {
    programmaticRef.current = true;
  }, []);

  const endProgrammaticScroll = useCallback(() => {
    requestAnimationFrame(() => {
      programmaticRef.current = false;
    });
  }, []);

  const isProgrammaticScroll = useCallback(() => programmaticRef.current, []);

  const value = useMemo(
    () => ({
      playing,
      speed,
      reducedMotion,
      holdScroll,
      mapDriving,
      setPlaying,
      setSpeed,
      pause,
      setHoldScroll,
      setMapDriving,
      beginProgrammaticScroll,
      endProgrammaticScroll,
      isProgrammaticScroll,
    }),
    [
      playing,
      speed,
      reducedMotion,
      holdScroll,
      mapDriving,
      setPlaying,
      setSpeed,
      pause,
      setHoldScroll,
      setMapDriving,
      beginProgrammaticScroll,
      endProgrammaticScroll,
      isProgrammaticScroll,
    ],
  );

  return <AutoplayContext.Provider value={value}>{children}</AutoplayContext.Provider>;
}

export function useAutoplay(): AutoplayContextValue {
  const value = useContext(AutoplayContext);
  if (!value) {
    throw new Error('useAutoplay requires AutoplayProvider');
  }
  return value;
}

/** Maps may render outside a provider in tests; no-op when absent. */
export function useOptionalAutoplay(): AutoplayContextValue | null {
  return useContext(AutoplayContext);
}
