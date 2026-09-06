import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'StoryDetail.tsx'), 'utf8');
const app = readFileSync(join(here, '..', 'App.tsx'), 'utf8');
const domain = readFileSync(join(here, '../../domain/story.ts'), 'utf8');

describe('StoryDetail', () => {
  it('shows chapters, stats, gallery, video, and a map for a tapped ICE story', () => {
    expect(domain).toContain('place?:');
    expect(domain).toContain('chapters?:');
    expect(domain).toContain('imagesAfter?:');
    expect(source).toContain('imagesAfter');
    expect(source).toContain('chapter.images');
    expect(source).toContain('story-spread-single');
    expect(domain).toContain('stats?:');
    expect(domain).toContain('videoTitle?:');
    expect(domain).toContain('videos?:');
    expect(domain).toContain('sourceCard?:');
    expect(source).toContain('story-detail');
    expect(source).toContain('story-stats');
    expect(source).toContain('splitStoryImages');
    expect(source).toContain('story-spread');
    expect(source).not.toContain('story-gallery');
    expect(source).toContain('story-video');
    expect(source).toContain('videoEmbedSrc');
    expect(source).toContain('story.videos');
    expect(source).toContain('story-source');
    expect(source).toContain('copy.storyMapLocation');
    expect(source.indexOf('chapters.map')).toBeLessThan(source.indexOf('story-video'));
    expect(source.indexOf('story-video')).toBeLessThan(source.indexOf('story-source'));
    expect(source).toContain('MapPane');
    expect(source).toContain('RegionMapTour');
    expect(source).toContain('story.mapTitle');
    expect(source).not.toContain('Districts SIMAD supported in the drought');
    expect(source).not.toContain('SIMAD supported drought impact');
    expect(source).toContain('story-map-bleed');
    expect(source.indexOf('story-lede')).toBeLessThan(source.indexOf('story-map-bleed'));
    expect(source).toContain('index === 0 && story.tourStops');
    expect(source).toContain('story.chapters');
    expect(source).toContain('useLayoutEffect');
    expect(source).toContain('scrollPageToTop');
    expect(app).toContain('StoryDetail');
    expect(app).toContain('scrollPageToTop');
  });

  it('ends the page with a visible source credit for pictures and video', () => {
    expect(source).toContain('MediaSourceCredit');
    expect(source).toContain('storyMediaCredit(story)');
    expect(source.lastIndexOf('MediaSourceCredit')).toBeGreaterThan(source.lastIndexOf('copy.moreInfo'));
  });

  it('offers related CTAs from the shared related-links map when a callback is provided', () => {
    expect(source).toContain('onOpenRelated');
    expect(source).toContain('relatedTargetsForStory');
    expect(source).toContain('RelatedLinks');
    expect(source).toContain('labelForRelatedTarget');
    expect(source.indexOf('RelatedLinks')).toBeLessThan(source.lastIndexOf('MediaSourceCredit'));
    expect(app).toContain('onOpenRelated');
    expect(app).toContain('openRelated');
    expect(app).toMatch(/openRelated[\s\S]{0,400}climate-impact/);
    expect(app).toMatch(/setImpactHazard\(target\.id\)/);
  });

  it('shows related pages as image cards before the final media credit', () => {
    expect(source).toContain('RelatedLinks');
    expect(source.indexOf('RelatedLinks')).toBeLessThan(source.lastIndexOf('MediaSourceCredit'));
    const relatedLinks = readFileSync(join(here, 'RelatedLinks.tsx'), 'utf8');
    expect(relatedLinks).toContain('related-link-cards');
    expect(relatedLinks).toContain('imageForRelatedTarget');
  });
});

