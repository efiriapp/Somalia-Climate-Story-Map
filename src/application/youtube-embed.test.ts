import { describe, expect, it } from 'vitest';
import { youtubeEmbedSrc } from './youtube-embed';

describe('youtubeEmbedSrc', () => {
  it('turns youtu.be links into embed URLs', () => {
    expect(youtubeEmbedSrc('https://youtu.be/osuiqTcIEeM?si=abc')).toBe(
      'https://www.youtube.com/embed/osuiqTcIEeM',
    );
    expect(youtubeEmbedSrc('https://youtu.be/WcUbn9Oo0A8?si=gdNaN6eA4qSAnDHz')).toBe(
      'https://www.youtube.com/embed/WcUbn9Oo0A8',
    );
    expect(youtubeEmbedSrc('https://ice.simad.edu.so/')).toBeNull();
  });
});
