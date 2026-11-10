import { describe, expect, it } from 'vitest';
import { climateImpactPages } from '../content/climate-impact';
import { CLIMATE_IMAGE_SOURCES } from '../content/media-sources';
import { stories } from '../content/stories';
import { apaDate, citeImage, cleanTitle, citeVideo, formatImageSource, mediaSourceList, storyImages } from './citations';

const storyVideos = stories.flatMap((story) => [
  ...(story.videoUrl ? [{ url: story.videoUrl, title: story.videoTitle }] : []),
  ...(story.videos ?? []),
]);
const climateVideos = climateImpactPages.flatMap((page) => page.videos);
const allVideos = [...storyVideos, ...climateVideos];

describe('video citations (APA 7)', () => {
  it('formats dates the APA way', () => {
    expect(apaDate('2023-11-18')).toBe('2023, November 18');
    expect(apaDate(null)).toBe('n.d.');
  });

  it('tidies platform titles', () => {
    expect(cleanTitle('Beach Cleaning  Campaign | Ololaha Liido | ')).toBe('Beach Cleaning Campaign | Ololaha Liido');
  });

  it('cites a YouTube video with channel, date, title, [Video], platform and URL', () => {
    expect(citeVideo('https://youtu.be/MjYZsu23LkE?si=x').text).toBe(
      'AP Archive. (2023, November 18). Deadly floods continue to ravage Somalia [Video]. YouTube. https://www.youtube.com/watch?v=MjYZsu23LkE',
    );
  });

  it('has a recorded source for every video on the site', () => {
    const missing = allVideos.filter((video) => citeVideo(video.url, video.title).rights === 'unconfirmed' && !/facebook\.com/.test(video.url));
    expect(missing.map((video) => video.url)).toEqual([]);
    for (const video of allVideos) {
      expect(citeVideo(video.url, video.title).text, video.url).toMatch(/\[Video\]\. (\([^)]*\)\. )?(YouTube|Facebook)\. https:\/\//);
    }
  });
});

describe('photo citations (TASL)', () => {
  it('formats title, author, source, date and licence', () => {
    expect(
      formatImageSource({
        title: 'Flooded street',
        creator: 'A. Photographer',
        publisher: 'Example Agency',
        date: '2023-11-11',
        license: '© Example Agency',
        rights: 'permission-needed',
      }),
    ).toBe('“Flooded street” by A. Photographer, Example Agency, 11 November 2023. © Example Agency.');
  });

  it('records a source for every Climate Impact photo in use', () => {
    const used = new Set([
      ...climateImpactPages.flatMap((page) => page.images),
      ...stories.flatMap(storyImages).filter((src) => src.startsWith('/images/climate-impact/')),
    ]);
    expect([...used].filter((src) => !CLIMATE_IMAGE_SOURCES[src])).toEqual([]);
  });

  it('cites every photo on every story with a non-empty source', () => {
    for (const story of stories) {
      for (const src of storyImages(story)) {
        const citation = citeImage(src, story);
        expect(citation.text.length, src).toBeGreaterThan(20);
      }
    }
  });

  it('names the photographer on Global Stage photos when the photo metadata does', () => {
    const cop27 = stories.find((story) => story.id === 'decoding-cop27')!;
    expect(citeImage(cop27.images[0]!, cop27).text).toContain('Photo by Johann Olivier, ICE Institute, SIMAD University');
  });

  it('groups photos that share one citation and keeps videos separate', () => {
    const story = stories.find((item) => item.id === 'simad-drought')!;
    const entries = mediaSourceList(storyImages(story), [{ url: 'https://youtu.be/MjYZsu23LkE' }], story);
    const photos = entries.filter((entry) => entry.kind === 'photo');
    expect(photos.reduce((sum, entry) => sum + entry.count, 0)).toBe(storyImages(story).length);
    expect(entries.at(-1)?.kind).toBe('video');
  });
});
