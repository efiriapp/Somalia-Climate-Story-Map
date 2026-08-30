import { describe, expect, it } from 'vitest';
import { scrollTourIndex } from './scroll-tour';

describe('scrollTourIndex', () => {
  it('shows the next slide on scroll down and the previous on scroll up', () => {
    expect(scrollTourIndex(20, 0, 4)).toBe(1);
    expect(scrollTourIndex(-20, 2, 4)).toBe(1);
  });

  it('lets the page keep scrolling at the first and last slide', () => {
    expect(scrollTourIndex(-20, 0, 4)).toBeNull();
    expect(scrollTourIndex(20, 3, 4)).toBeNull();
  });
});
