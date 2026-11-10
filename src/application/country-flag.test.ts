import { describe, expect, it } from 'vitest';
import { flagIconUrl } from './country-flag';

const countries = [
  'Somalia', 'United Kingdom', 'Saudi Arabia', 'Egypt', 'Rwanda', 'Kenya', 'Zambia', 'Ethiopia',
  'Ghana', 'Djibouti', 'Qatar', 'Azerbaijan', 'United Arab Emirates', 'Switzerland', 'France', 'Brazil',
];

describe('country flags', () => {
  it('maps each Global Stage country to a bundled flag, not an outside server', () => {
    for (const country of countries) {
      const url = flagIconUrl(country);
      expect(url, country).toBeTruthy();
      expect(url, country).not.toMatch(/flagcdn|^https?:/);
    }
    expect(new Set(countries.map(flagIconUrl)).size).toBe(countries.length);
  });

  it('returns null for an unknown country', () => {
    expect(flagIconUrl('Atlantis')).toBeNull();
  });
});
