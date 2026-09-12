import { describe, expect, it } from 'vitest';
import {
  AUTOPLAY_BASE_PX_PER_SEC,
  AUTOPLAY_SPEEDS,
  DEFAULT_AUTOPLAY_SPEED,
  clampAutoplaySpeed,
  isScrollComplete,
  maxScrollOffset,
  prefersReducedMotion,
  scrollPixelsForFrame,
} from './autoplay-scroll';

describe('autoplay-scroll', () => {
  it('exposes stepped speeds from 0.5x through 2x including 1x', () => {
    expect(AUTOPLAY_SPEEDS[0]).toBe(0.5);
    expect(AUTOPLAY_SPEEDS.at(-1)).toBe(2);
    expect(AUTOPLAY_SPEEDS).toContain(DEFAULT_AUTOPLAY_SPEED);
    expect(AUTOPLAY_SPEEDS).toEqual([0.5, 0.75, 1, 1.25, 1.5, 2]);
  });

  it('clamps arbitrary speed input to the nearest allowed step', () => {
    expect(clampAutoplaySpeed(0.4)).toBe(0.5);
    expect(clampAutoplaySpeed(0.9)).toBe(1);
    expect(clampAutoplaySpeed(1.4)).toBe(1.5);
    expect(clampAutoplaySpeed(9)).toBe(2);
  });

  it('scales scroll pixels by speed relative to the 1x baseline', () => {
    const oneSecond = 1000;
    expect(scrollPixelsForFrame(1, oneSecond)).toBe(AUTOPLAY_BASE_PX_PER_SEC);
    expect(scrollPixelsForFrame(0.5, oneSecond)).toBe(AUTOPLAY_BASE_PX_PER_SEC * 0.5);
    expect(scrollPixelsForFrame(2, oneSecond)).toBe(AUTOPLAY_BASE_PX_PER_SEC * 2);
    expect(scrollPixelsForFrame(1, 0)).toBe(0);
    expect(scrollPixelsForFrame(1, -5)).toBe(0);
  });

  it('detects scroll completion and max offset', () => {
    expect(maxScrollOffset(2000, 800)).toBe(1200);
    expect(maxScrollOffset(500, 800)).toBe(0);
    expect(isScrollComplete(1199, 1200)).toBe(true);
    expect(isScrollComplete(100, 1200)).toBe(false);
    expect(isScrollComplete(0, 0)).toBe(true);
  });

  it('respects prefers-reduced-motion when the media query matches', () => {
    expect(prefersReducedMotion({ matches: true })).toBe(true);
    expect(prefersReducedMotion({ matches: false })).toBe(false);
    expect(prefersReducedMotion(null)).toBe(false);
  });
});
