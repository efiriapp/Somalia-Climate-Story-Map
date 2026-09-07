import { describe, expect, it } from 'vitest';
import { flagIconUrl } from './country-flag';

describe('country flags', () => {
  it('maps each Global Stage country to a flag icon URL', () => {
    expect(flagIconUrl('Egypt')).toBe('https://flagcdn.com/w40/eg.png');
    expect(flagIconUrl('Qatar')).toBe('https://flagcdn.com/w40/qa.png');
    expect(flagIconUrl('Rwanda')).toBe('https://flagcdn.com/w40/rw.png');
    expect(flagIconUrl('United Arab Emirates')).toBe('https://flagcdn.com/w40/ae.png');
    expect(flagIconUrl('Azerbaijan')).toBe('https://flagcdn.com/w40/az.png');
    expect(flagIconUrl('Switzerland')).toBe('https://flagcdn.com/w40/ch.png');
    expect(flagIconUrl('Kenya')).toBe('https://flagcdn.com/w40/ke.png');
    expect(flagIconUrl('Zambia')).toBe('https://flagcdn.com/w40/zm.png');
    expect(flagIconUrl('Ethiopia')).toBe('https://flagcdn.com/w40/et.png');
    expect(flagIconUrl('Brazil')).toBe('https://flagcdn.com/w40/br.png');
    expect(flagIconUrl('Djibouti')).toBe('https://flagcdn.com/w40/dj.png');
    expect(flagIconUrl('France')).toBe('https://flagcdn.com/w40/fr.png');
    expect(flagIconUrl('Ghana')).toBe('https://flagcdn.com/w40/gh.png');
    expect(flagIconUrl('Somalia')).toBe('https://flagcdn.com/w40/so.png');
    expect(flagIconUrl('United Kingdom')).toBe('https://flagcdn.com/w40/gb.png');
    expect(flagIconUrl('Saudi Arabia')).toBe('https://flagcdn.com/w40/sa.png');
  });

  it('returns null for an unknown country', () => {
    expect(flagIconUrl('Atlantis')).toBeNull();
  });
});
