import { describe, expect, it } from 'vitest';
import { formatKm2, haToKm2 } from './area';

describe('areas in km²', () => {
  it('converts hectares to km² (100 ha = 1 km²)', () => {
    expect(haToKm2(250)).toBe(2.5);
  });

  it('shows large areas whole, small ones with decimals so they never read 0', () => {
    expect(formatKm2(4_668_382)).toBe('46,684');
    expect(formatKm2(99_532)).toBe('995');
    expect(formatKm2(4_937)).toBe('49.4');
    expect(formatKm2(341.3)).toBe('3.4');
    expect(formatKm2(4)).toBe('0.04');
    expect(formatKm2(0)).toBe('0');
  });
});
