import { ORIGIN_HOLD_MS, DISTRICT_FLY_MS } from './region-map-tour';
import { clampAutoplaySpeed } from './autoplay-scroll';

/** Extra dwell so the slide card is readable after the fly lands. */
export const AUTOPLAY_SLIDE_READ_MS = 3200;

/** Time to spend on one region-map stop during autoplay (flight + card), scaled by speed. */
export function autoplayTourDwellMs(speed: number): number {
  const rate = clampAutoplaySpeed(speed);
  return (ORIGIN_HOLD_MS + DISTRICT_FLY_MS + AUTOPLAY_SLIDE_READ_MS) / rate;
}

/** Next stop index while autoplay drives a tour; null when the tour is finished. */
export function nextAutoplayTourIndex(current: number, length: number): number | null {
  if (length <= 0) return null;
  if (current < 0) return 0;
  if (current >= length - 1) return null;
  return current + 1;
}

/**
 * Whether page autoplay should keep running when scroll cannot advance
 * (e.g. Global Stage map is driving the experience instead).
 */
export function shouldKeepAutoplayAlive(
  maxScroll: number,
  mapDriving: boolean,
  holdScroll: boolean,
): boolean {
  if (holdScroll) return true;
  if (mapDriving && maxScroll <= 0) return true;
  return false;
}
