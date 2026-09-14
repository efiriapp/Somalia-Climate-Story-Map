import { describe, expect, it } from 'vitest';
import { videoEmbedSrc, youtubeEmbedSrc } from './youtube-embed';

describe('youtubeEmbedSrc', () => {
  it('turns youtu.be links into embed URLs', () => {
    expect(youtubeEmbedSrc('https://youtu.be/osuiqTcIEeM?si=abc')).toBe(
      'https://www.youtube.com/embed/osuiqTcIEeM',
    );
    expect(youtubeEmbedSrc('https://youtu.be/WcUbn9Oo0A8?si=gdNaN6eA4qSAnDHz')).toBe(
      'https://www.youtube.com/embed/WcUbn9Oo0A8',
    );
    expect(youtubeEmbedSrc('https://youtube.com/shorts/Pk0ZU1EsmWU?si=SYWrS1masvd1aVTX')).toBe(
      'https://www.youtube.com/embed/Pk0ZU1EsmWU',
    );
    expect(youtubeEmbedSrc('https://www.youtube.com/shorts/Pk0ZU1EsmWU')).toBe(
      'https://www.youtube.com/embed/Pk0ZU1EsmWU',
    );
    expect(youtubeEmbedSrc('https://ice.simad.edu.so/')).toBeNull();
  });
});

describe('videoEmbedSrc', () => {
  it('turns Facebook reel and share links into plugin embed URLs', () => {
    expect(videoEmbedSrc('https://www.facebook.com/reel/1412656927441281/')).toBe(
      'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1412656927441281%2F&show_text=false',
    );
    expect(videoEmbedSrc('https://www.facebook.com/ICESomalia/videos/1459612665336518/')).toBe(
      'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2FICESomalia%2Fvideos%2F1459612665336518%2F&show_text=false',
    );
    expect(videoEmbedSrc('https://www.facebook.com/share/v/1PpWwLxGGf/')).toBe(
      'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Fshare%2Fv%2F1PpWwLxGGf%2F&show_text=false',
    );
    expect(videoEmbedSrc('https://www.facebook.com/share/r/1PXwb4Yd2U/')).toBe(
      'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Fshare%2Fr%2F1PXwb4Yd2U%2F&show_text=false',
    );
    expect(videoEmbedSrc('https://youtu.be/_vxiN3n1Ckk?si=je-l4KCcFWDSTGA9')).toBe(
      'https://www.youtube.com/embed/_vxiN3n1Ckk',
    );
    expect(videoEmbedSrc('https://ice.simad.edu.so/')).toBeNull();
  });
});
