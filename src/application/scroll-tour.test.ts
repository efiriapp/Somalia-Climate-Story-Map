import { describe, expect, it } from 'vitest';
import { scrollTourIndex } from './scroll-tour';

describe('scrollTourIndex', () => {
  it('shows the next slide on scroll down and the previous on scroll up', () => {
    expect(scrollTourIndex(20, -1, 5)).toBe(0);
    expect(scrollTourIndex(20, 0, 5)).toBe(1);
    expect(scrollTourIndex(-20, 2, 5)).toBe(1);
    expect(scrollTourIndex(-20, 0, 5)).toBe(-1);
  });

  it('keeps the page on the map until the last point, then lets the rest of the page scroll', () => {
    expect(scrollTourIndex(-20, -1, 5)).toBeNull();
    expect(scrollTourIndex(20, 4, 5)).toBeNull();
  });
});
