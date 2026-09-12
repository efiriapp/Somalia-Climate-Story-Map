import { describe, expect, it } from 'vitest';
import { DISTRICT_FLY_MS, ORIGIN_HOLD_MS } from './region-map-tour';
import {
  AUTOPLAY_SLIDE_READ_MS,
  autoplayTourDwellMs,
  nextAutoplayTourIndex,
  shouldKeepAutoplayAlive,
} from './autoplay-map-sync';

describe('autoplay-map-sync', () => {
  it('scales tour dwell by reading speed around flight + card time', () => {
    const base = ORIGIN_HOLD_MS + DISTRICT_FLY_MS + AUTOPLAY_SLIDE_READ_MS;
    expect(autoplayTourDwellMs(1)).toBe(base);
    expect(autoplayTourDwellMs(2)).toBe(base / 2);
    expect(autoplayTourDwellMs(0.5)).toBe(base / 0.5);
  });

  it('advances tour indices and ends after the last stop', () => {
    expect(nextAutoplayTourIndex(-1, 3)).toBe(0);
    expect(nextAutoplayTourIndex(0, 3)).toBe(1);
    expect(nextAutoplayTourIndex(2, 3)).toBe(null);
    expect(nextAutoplayTourIndex(0, 0)).toBe(null);
  });

  it('keeps autoplay alive while a map holds scroll or drives a non-scrolling stage', () => {
    expect(shouldKeepAutoplayAlive(0, false, false)).toBe(false);
    expect(shouldKeepAutoplayAlive(0, true, false)).toBe(true);
    expect(shouldKeepAutoplayAlive(1200, false, true)).toBe(true);
    expect(shouldKeepAutoplayAlive(1200, false, false)).toBe(false);
  });
});
