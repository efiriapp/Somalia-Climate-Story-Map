import { describe, expect, it } from 'vitest';
import { formatNumber, niceStep } from './chart-scale';

describe('chart scale', () => {
  it('picks round axis steps (1, 2 or 5 × a power of ten)', () => {
    expect(niceStep(900)).toBe(500);
    expect(niceStep(60)).toBe(20);
    expect(niceStep(3)).toBe(1);
  });

  it('writes large numbers short', () => {
    expect(formatNumber(1234)).toBe('1,234');
    expect(formatNumber(25_400)).toBe('25K');
    // Small values (e.g. km² of forest lost in a year) keep their decimals.
    expect(formatNumber(0.5)).toBe('0.5');
    expect(formatNumber(2.25)).toBe('2.25');
  });
});
