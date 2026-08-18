import { describe, expect, it } from 'vitest';
import { aboutIce } from './about-ice';

describe('about ICE Institute', () => {
  it('introduces ICE as SIMAD University’s climate institute', () => {
    expect(aboutIce.title).toBe('About ICE Institute');
    expect(aboutIce.website).toBe('https://ice.simad.edu.so/about/');
    expect(aboutIce.paragraphs.length).toBeGreaterThanOrEqual(3);
    expect(aboutIce.paragraphs.join(' ')).toMatch(/SIMAD University/);
    expect(aboutIce.paragraphs.join(' ')).toMatch(/policy and action research/i);
  });
});
