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
    expect(domain).toContain('stats?:');
    expect(domain).toContain('videoTitle?:');
    expect(source).toContain('story-detail');
    expect(source).toContain('story-stats');
    expect(source).toContain('story-gallery');
    expect(source).toContain('story-video');
    expect(source).toContain('MapPane');
    expect(source).toContain('RegionMapTour');
    expect(source).toContain('SIMAD supported drought impact');
    expect(source).toContain('story-map-bleed');
    expect(source.indexOf('story-lede')).toBeLessThan(source.indexOf('story-map-bleed'));
    expect(source).toContain('index === 0 && story.tourStops');
    expect(source).toContain('story.chapters');
    expect(source).toContain('useLayoutEffect');
    expect(source).toContain('window.scrollTo(0, 0)');
    expect(app).toContain('StoryDetail');
    expect(app).toContain('window.scrollTo(0, 0)');
  });
});
