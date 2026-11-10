import { describe, expect, it } from 'vitest';
import { clipDescription, pageTitle } from './usePageMeta';

describe('page meta helpers', () => {
  it('prefixes the story title before the platform name', () => {
    expect(pageTitle('Platform')).toBe('Platform');
    expect(pageTitle('Platform', 'Floods in Beledweyne')).toBe('Floods in Beledweyne | Platform');
  });

  it('keeps short descriptions and clips long ones at a word boundary', () => {
    expect(clipDescription('  Short   text ')).toBe('Short text');
    const long = 'word '.repeat(60);
    const clipped = clipDescription(long);
    expect(clipped.length).toBeLessThanOrEqual(160);
    expect(clipped.endsWith('word…')).toBe(true);
  });
});
